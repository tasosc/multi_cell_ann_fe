import { Sources } from "./sources";
import { CurrentState, Stage } from "./Stage";

export interface Routing {
    currentStatus: CurrentState; 
}

export function get_next_stage(routing: Routing) : Stage | null {
    switch(routing.currentStatus.stage) {
        case Stage.Tissue:
            return Stage.Repo;
        case Stage.Repo:
            return Stage.Cell;
        case Stage.Cell:
            return Stage.Settings;
        case Stage.Settings:
            return Stage.File;
        case Stage.File:
            return Stage.Analysis;
        case Stage.Analysis:
            return null;
        default:
            return null;
    }
}
export function get_prev_stage(routing: Routing) : Stage| null {
    console.log("Current stage:" + Stage[routing.currentStatus.stage]);
    switch(routing.currentStatus.stage) {
        case Stage.Tissue:
            return null;
        case Stage.Repo:
            return Stage.Tissue;
        case Stage.Cell:
            return Stage.Repo;
        case Stage.Settings:
            return Stage.Cell;
        case Stage.File:
            return Stage.Settings;
        case Stage.Analysis:
            return Stage.File;
        case Stage.Completed:
            return Stage.Analysis;
        default:
            return Stage.Tissue;
    }
}
export function get_disabled(routing: Routing) : boolean {
    switch(routing.currentStatus.stage) {
        case Stage.Source:
            return routing.currentStatus.source == Sources.None;
        case Stage.ImportFile:
            return routing.currentStatus.cells.length == 0;
        case Stage.Tissue:
            return !routing.currentStatus.selectTissue;
        case Stage.Repo:
            return routing.currentStatus.selectedRepo.length == 0;
        case Stage.Cell:
            return routing.currentStatus.cells.length == 0;
        case Stage.Settings:
            return false;
        case Stage.File:
            return !routing.currentStatus.session_id;
        case Stage.Analysis:
            return true;
        case Stage.Completed:
            return false;
        default:
            return false;
    }
}