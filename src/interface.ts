export interface ITargetActorRunOptions {
    token: string;
    build: string;
}
export interface IInput {
    parallelRunsCount: number;
    targetActorRunOptions: ITargetActorRunOptions;
    userID: number;
    data: IData[];
    maxFileInZip: number;
    actorID: string;
    runInEachActor: number;
}

export interface IState {
    parallelRunIds: string[];
    data: IData[];
    runningTasks: any[];
}

export interface IData {
    url: string;
    filename: string;
    fullFilePath: string;
    selector: string;
}
