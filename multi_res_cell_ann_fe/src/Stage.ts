import { Sources } from "./SelectSource";

export enum Stage {
    Source = 0,
    Repo,
    ImportFile,
    Tissue,
    Cell,
    File,
    Analysis,
    Completed
}

export interface CurrentState {
    stage:  Stage;
    selectedRepo: string[];
    selectTissue: string;
    source: Sources;
}
