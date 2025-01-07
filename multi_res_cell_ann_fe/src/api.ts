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
    get_cells(tissue: string, sources: string[], setSources: (sources: string[]) => void) {
        let queryParameter = sources.length > 0 ? `?sources=${sources.join(',')}` : '';
        let sourcesUrl= new URL(`tissues/${tissue}/cells${queryParameter}`, this.url);
        fetch(sourcesUrl)
        .then(res => res.json())
        .then(setSources)
    }
}