export class BackendApi {
    url: URL;

    constructor() {
        const base_url = import.meta.env.VITE_APP_API_URL;
        this.url = new URL(base_url);
    }

    get_tissues() : Promise<string[]> {
        let tissuesUrl= new URL("tissues", this.url);
        return fetch(tissuesUrl)
        .then(res => res.json())
    }

    get_sources(tissue: string, setSources: (sources: string[]) => void) {
        let sourcesUrl= new URL(`tissues/${tissue}/sources`, this.url);
        fetch(sourcesUrl)
        .then(res => res.json())
        .then(setSources)
    }
    get_cells(tissue: string, sources: string[]): Promise<Cell[]> {
        const queryParameters = sources ? sources.join('&sources=') : '';
        let queryParameter = queryParameters.length > 0 ? `?sources=${queryParameters}` : '';
        let sourcesUrl= new URL(`tissues/${tissue}/cells${queryParameter}`, this.url);
        return fetch(sourcesUrl)
        .then(res => res.json())
    }
}

export interface Cell {
    cell_type: string;
    gene_selection?: string[];
    genes: string[];
    is_selected: boolean;
    new_genes?: string[];
}

export class CellImpl implements Cell {
    cell_type: string;
    gene_selection?: string[];
    genes: string[];
    is_selected: boolean;
    new_genes?: string[];
    constructor(cell_type: string, genes: string[] ) {
        this.cell_type = cell_type;
        this.genes = genes;
        this.is_selected = false;
    }
}