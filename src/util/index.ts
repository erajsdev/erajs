
export const uniqueId = (length = 12): string => {
    const a = new Uint8Array(length)
    window.crypto.getRandomValues(a)
    const bin = String.fromCharCode.apply(null, <any>a)
    const str = btoa(bin)
    return str.substr(0, length)
}



