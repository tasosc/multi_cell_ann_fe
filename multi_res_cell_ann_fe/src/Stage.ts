export enum Stage {
    Source = 0,
    ImportFile,
    Tissue,
    Cell,
    File,
    Analysis,
    Completed
}

export interface CurrentState {
    stage:  Stage;
    selectedSource: string
}
