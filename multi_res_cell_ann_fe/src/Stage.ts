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
    dataset?: File | null;
}

export interface CurrentStateExport {
    stage:  Stage;
    selectTissue: string;
    cells: Cell[];
    settings?: Settings;
}

export function to_export(status: CurrentState) : CurrentStateExport {
    const stage = (status.stage == Stage.Analysis) ? Stage.File : status.stage;
    return { stage: stage, selectTissue: status.selectTissue, cells: status.cells, settings: status.settings };
}

export function from_export(imported_status: CurrentStateExport) : CurrentState {
    return {stage: imported_status.stage, selectTissue: imported_status.selectTissue, cells: imported_status.cells, settings: imported_status.settings, selectedRepo: [], source: Sources.Import};
}