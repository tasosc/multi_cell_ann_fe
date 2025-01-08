export function get_key(value: string) {
    return `key${value.replace(/[ .]/g, "_").toLowerCase()}`;
}

