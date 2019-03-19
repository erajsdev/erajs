
export const tuple = <T extends string[]>(...args: T) => <T>Object.freeze(args);
export const constMap = <T extends {[s:string]:string}>(o: T) => o;
export const keys = <T, K extends keyof T>(o: T): K[] => <K[]>Object.keys(o);

export const isInArray = <T extends string[]>(key: string, array: T): key is T[number] => {
    const idx = array.indexOf(key)
    return idx !== -1
}

export const getOrDefault = <T>(o: any, key: string, defaultValue: T): T => {
    if (!o || typeof (o) !== 'object') {
        return defaultValue
    }
    const val = o[key]
    if (typeof (val) === typeof (defaultValue))
        return val
    else
        return defaultValue
}

export const getString = <T>(o: any, key: string, defaultValue: T): string | T => {
    if (!o || typeof (o) !== 'object') {
        return defaultValue
    }
    const val = o[key]
    if (typeof (val) === 'string')
        return val
    else
        return defaultValue
}

export const getStringOrError = (o: any, key: string, errorString: string): string => {
    if (!o || typeof (o) !== 'object') {
        throw new Error(errorString)
    }
    const val = o[key]
    if (typeof (val) === 'string')
        return val
    else
        throw new Error(errorString)
}

export const getNumber = <T>(o: any, key: string, defaultValue: T): number | T => {
    if (!o || typeof (o) !== 'object') {
        return defaultValue
    }
    const val = o[key]
    if (typeof (val) === 'number')
        return val
    else
        return defaultValue
}

