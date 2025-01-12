export function get_key(value: string) {
    return `key${value.replace(/[ .]/g, "_").toLowerCase()}`;
}
export function is_valid<Type>(array : Array<Type> | null | undefined) : boolean {
    return array ? array.length > 0 : false;
}

