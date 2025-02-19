import { merge } from "./utils";


export class BackendApi {
    url: URL;

    constructor() {
        const base_url = import.meta.env.VITE_APP_API_URL;
        this.url = new URL(base_url);
    }

    get_tissues() : Promise<string[]> {
        const tissuesUrl= new URL("tissues", this.url);
        return fetch(tissuesUrl)
        .then(res => res.json())
    }

    get_sources(tissue: string, setSources: (sources: string[]) => void) {
        const sourcesUrl= new URL(`tissues/${tissue}/sources`, this.url);
        fetch(sourcesUrl)
        .then(res => res.json())
        .then(setSources)
    }
    get_cells(tissue: string, sources: string[]): Promise<Cell[]> {
        const queryParameters = sources ? sources.join('&sources=') : '';
        const queryParameter = queryParameters.length > 0 ? `?sources=${queryParameters}` : '';
        const sourcesUrl= new URL(`tissues/${tissue}/cells${queryParameter}`, this.url);
        return fetch(sourcesUrl)
        .then(res => res.json())
    }

    get_default_settings() : Promise<Settings> {
        const settingsUrl= new URL("metadata/settings/defaults", this.url);
        return fetch(settingsUrl)
        .then(res => res.json())
    }

    async create_session(settings: Settings, cells: Cell[]) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const resource = new URL("session", this.url);
        const simple_cells : SimpleCells[] = cells.map(cell => { return {cell_type: cell.cell_type, genes: cell.is_selected ? cell.genes : merge(cell.gene_selection, cell.new_genes)}});
        const res = await fetch(resource, { method: "POST", headers: myHeaders, body: JSON.stringify({ settings: settings, cells: simple_cells }) });
        return await res.json();
    }
    analyze(session: string, dataset?: File|null) {
        if (!session){
            console.log("Session not defined");
            throw new Error("Session is null");
        }
        const resource = new URL(`dataset/${session}`, this.url);
        const formData : FormData = new FormData();
        if (dataset) {
            formData.append('file', dataset);
        }
        else {
            formData.append('file', '');
        }

        return fetch(resource, { method: "POST", body: formData});
    }
    build_download_link(link: string) {
        const resource = new URL(link, this.url);
        return resource.toString();
    }
    open_socket(session: string) {
        if (!session){
            console.log("Session not defined");
            throw new Error("Session is null");
        }
        const resource = new URL(`ws/${session}`, this.url);
        resource.protocol = "ws:";
        return new WebSocket(resource);
    }
}

export const api_instance = new BackendApi();

interface SimpleCells {
    cell_type: string;
    genes: string[];
}

export interface Cell {
    cell_type: string;
    gene_selection?: string[];
    genes: string[];
    is_selected: boolean;
    new_genes?: string[];
}

export enum SvdSolverOptions {
    arpack = "arpack",
    lobpcg = "lobpcg",
    auto = "auto",
    randomized = "randomized"
}

export enum ReportingOptions {
    none = 0,
    as_progress=1 << 1,
    pdf = 1 << 2
}

export interface Settings {
    cluster_resolution: number; // = 0.4
    svd_solver: SvdSolverOptions; // = SvdSolverOptions.arpack
    leiden_key: string; // = "leiden"
    n_genes_min: number; // = 1000
    n_genes_max: number; // = 10000
    min_genes: number; // = 100
    min_cells: number; // = 3
    n_counts_max: number; // = 30000
    pc_mito: number; // = 20
    pc_rib: number; // = 25
    n_neigh: number; // = 10
    n_pcs: number; // = 40
    csv_delimiter: string; // = ","
    normalize_total_counts: boolean; // = False
    only_highly_significant_genes: boolean; // = False
    verbosity: number; // = 1
    output: ReportingOptions; // = ReportingOptions.as_progress | ReportingOptions.pdf
}

export function default_settings(): Settings {
    return {
        cluster_resolution: 0.4,
        svd_solver: SvdSolverOptions.arpack,
        leiden_key: "leiden",
        n_genes_min: 1000,
        n_genes_max: 10000,
        min_genes: 100,
        min_cells: 3,
        n_counts_max: 30000,
        pc_mito: 20,
        pc_rib: 25,
        n_neigh: 10,
        n_pcs: 40,
        csv_delimiter: ",",
        normalize_total_counts: false,
        only_highly_significant_genes: false,
        verbosity: 1,
        output: ReportingOptions.as_progress | ReportingOptions.pdf
    }
}
export enum Activity {
    NONE = '',
    PARSE_DATASET = 'parse_dataset',
    UPLOAD_DATASET = 'upload_dataset',
    PP_QC = 'pp_qc',
    PP_NORM = 'pp_nrom',
    PP_FEATURE = 'pp_feature',
    PP_REDUCTION = 'pp_reduction',
    PP_VISUALIAZTION = 'pp_visualiaztion',
    SI_CLUSTERING = 'si_clustering',
    SI_ANNOTATION = 'si_annotation',
    SI_FILE = 'si_file',
    END = "end"
}
export interface FeedbackModel {
    activity: Activity;
    finished: Date|string;
    duration: number;
    message?: string;
    link?: string
}