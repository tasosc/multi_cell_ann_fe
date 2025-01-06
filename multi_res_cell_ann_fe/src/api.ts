export class BackendApi {
    url: URL;

    constructor(theUrl: string) {
        this.url = new URL(theUrl);
    }

    get_tissues(setTissues : (tissues : string[]) => void) {
        let tissuesUrl= new URL("tissues", this.url);
        fetch(tissuesUrl)
        .then(res => res.json())
        .then(setTissues)
    }
}