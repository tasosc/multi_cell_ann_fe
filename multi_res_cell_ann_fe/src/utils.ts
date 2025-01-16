export function get_key(value: string) {
    return `key${value.replace(/[ .]/g, "_").toLowerCase()}`;
}
export function is_valid<Type>(array : Array<Type> | null | undefined) : boolean {
    return array ? array.length > 0 : false;
}

export function merge<Type>(array1?: Array<Type>, array2?: Array<Type>): Array<Type> {
    return [...array1 ?? [], ...array2 ?? []];
}

