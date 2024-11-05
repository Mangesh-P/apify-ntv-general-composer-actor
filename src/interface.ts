export interface ITargetActorRunOptions {
    token: string;
    build: string;
}
export interface IInput {
    parallelRunsCount: number;
    targetActorRunOptions: ITargetActorRunOptions;
    userID: number;
    urlsInfo: IUrlInfo[];
    maxFileInZip: number;
    actorID: string;
    runInEachActor: number;
}

export interface IState {
    parallelRunIds: string[];
    urlsInfo: IUrlInfo[];
    runningTasks: any[];
}

export interface IUrlInfo {
    url: string;
    filename: string;
    fullFilePath: string;
    selector: string;
}
