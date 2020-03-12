// get id from url
export function getId(url, key) {
    let reg
    switch (key) {
        case "clazz":
            reg = /clazz\/(\d+)/
            break;
        default:
            break;
    }
    let result = url.match(reg)

    if (result && result[1]) {
        return result[1]
    }
    return null
}