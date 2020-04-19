// get id from url
export function getId(url, key) {
    let reg
    switch (key) {
        case "clazz":
            reg = /clazz\/(\d+)/
            break;
        case "experimental-item":
            reg = /experimental-item\/(\d+)/
            break;
        case "experimental-task":
            reg = /experimental-task\/(\d+)/
            break;
        case "dataset":
            reg = /dataset\/(\d+)/
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