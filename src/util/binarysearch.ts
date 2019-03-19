
/*
declare global {
    interface Array<T> {
        binarySearch(n: T): number
    }
}
Array.prototype.binarySearch = function <T>(this: T[], val: T): number {
    const array = this
    let min = 0
    let max = array.length - 1
    while (min <= max) {
        const idx = ((min + max) / 2) | 0
        const elem = array[idx]
        if (val === elem) {
            return idx
        }
        else if (val < elem) {
            max = idx - 1
        }
        else {
            min = idx + 1
        }
    }
    return -min
}
*/