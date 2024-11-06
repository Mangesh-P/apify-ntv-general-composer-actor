import { Actor, ActorRun, log } from 'apify';
import { saveError } from './utils.js';
import { IInput, IState, ITargetActorRunOptions, IData } from './interface.js';
import { overrideSettingsByActor } from './override.settings.js';

await Actor.init();

const input = await Actor.getInput<IInput>() ?? {} as IInput;

const {
    targetActorRunOptions = {
        build: 'latest',
        token: '',
    } as ITargetActorRunOptions,
    userID,
    actorID,
    data = [] as IData[],
} = input;

let { runInEachActor, parallelRunsCount } = input;

const { apifyClient } = Actor;

// Get the current run request queue and dataset, we use the default ones.
const dataset = await Actor.openDataset();
const keyValueStore = await Actor.openKeyValueStore();
log.info('Store ID:', { storeId: keyValueStore.id });
log.info('Starting run', { parallelRunsCount });

const state = await Actor.useState<IState>('actor-state', {
    parallelRunIds: [],
    data: [],
    runningTasks: [] as ActorRun[],
});

({ runInEachActor, parallelRunsCount } = overrideSettingsByActor({
    actorID,
    runInEachActor,
    parallelRunsCount,
}));

try {
    log.info('actorID', { actorID });
    log.info('targetActorRunOptions', targetActorRunOptions);

    await startToFinish();
} catch (error: any) {
    await saveError(error);
    await Actor.fail('Execution failed!');
} finally {
    await Actor.exit('Execution finished!');
}

async function startToFinish() {
    // Abort parallel runs if the main run is aborted
    Actor.on('aborting', async () => {
        log.info('Aborting parallel runs');
        for (const runId of state.parallelRunIds) {
            log.info('Aborting run', { runId });
            await apifyClient.run(runId).abort();
        }
    });

    await loopActorRun(data);

    log.info('All parallel runs finished');
}

async function loopActorRun(lUrlsInfo: IData[]) {
    state.data = lUrlsInfo;
    log.info('Starting parallel runs', { parallelRunsCount });

    // Start initial tasks
    if (parallelRunsCount) {
        for (let i = 0; i < parallelRunsCount && state.data.length > 0; i++) {
            const lInfo = state.data.splice(0, runInEachActor);
            state.runningTasks.push(startActorRun(lInfo));
        }
    }

    while (state.runningTasks.length > 0) {
        const taskIndex = await Promise.race(
            state.runningTasks.map(async (task, index) => {
                if (task instanceof Promise) {
                    return await task
                        .then(() => index)
                        .catch((error: any) => {
                            log.error('Task failed', { error });
                            return -1;
                        });
                }
                return index;
            }),
        );
        await state.runningTasks[taskIndex]
            .then((run: ActorRun) => {
                log.info(`Task finished with ID :`, {
                    id: run?.id,
                    status: run?.status,
                });
                state.runningTasks.splice(taskIndex, 1);
            })
            .catch((error: any) => {
                log.error('Task failed', { error });
                state.runningTasks.splice(taskIndex, 1);
            });

        if (state.data.length > 0) {
            const lInfo = state.data.splice(0, runInEachActor);
            state.runningTasks.push(startActorRun(lInfo));
        }
    }
}

async function startActorRun(lUrlsInfo: IData[]): Promise<ActorRun | boolean> {
    let run: Promise<ActorRun> | null = null;

    const dataTemp = lUrlsInfo.map((info) => ({
        ...info,
        datasetId: dataset.id,
        keyValueStoreId: keyValueStore.id,
        userID,
    }));

    run = Actor.start(
        actorID,
        {
            ...{ data: dataTemp },
        },
        targetActorRunOptions,
    );
    log.info('Starting lightbox actor run', { lUrlsInfo });

    if (run !== null) {
        const runResult = await run;

        log.info(`Started parallel run with ID: ${runResult.id}`, {
            build: runResult.options.build,
        });

        state.parallelRunIds.push(runResult.id);

        const runClient = apifyClient.run(runResult.id);
        return runClient.waitForFinish();
    }
    log.error('Invalid url info', { lUrlsInfo });
    return false;
}
