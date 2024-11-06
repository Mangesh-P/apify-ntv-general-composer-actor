export interface ITargetActorRunOptions {
    token: string;
    build: string;
}
export interface IInput extends ISettings {
    userID: number;
    data: IData[];
}

export interface ISettings {
    actorID: string;
    runInEachActor?: number;
    targetActorRunOptions?: ITargetActorRunOptions;
    parallelRunsCount?: number;
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
