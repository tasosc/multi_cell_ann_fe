import { Cell, Settings } from "./api";
import { Sources } from "./SelectSource";

export enum Stage {
    Source = 0,
    Repo,
    ImportFile,
    Tissue,
    Cell,
    Settings,
    File,
    Analysis,
    Completed
}

export interface CurrentState {
    stage:  Stage;
    selectedRepo: string[];
    selectTissue: string;
    source: Sources;
    cells: Cell[];
    settings?: Settings;
}
