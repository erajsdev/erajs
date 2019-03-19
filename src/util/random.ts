

/**
 * nにscaleMinからscaleMaxまでの間をランダムで掛ける
 */
export const randomScale = (n: number, scaleMin: number, scaleMax: number) => {
    const r = Math.random()
    const s = r * (scaleMax - scaleMin) + scaleMin
    return n * s
}
/**
 * nにscaleMinからscaleMaxまでの間をランダムで掛ける。結果は整数
 */
export const randomScaleI = (n: number, scaleMin: number, scaleMax: number) => {
    return Math.floor(randomScale(n, scaleMin, scaleMax))
}
