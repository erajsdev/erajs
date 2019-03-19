
/**
 * 経験数の段階上昇に必要な値
 */
export const expLevels = Object.freeze([0, 1, 4, 20, 50, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000])

/**
 * 変動値の段階上昇に必要な値
 */
export const gaugeLevels = Object.freeze([0, 100, 500, 3000, 10000, 30000, 60000, 100000, 150000, 250000])

/**
 * 変動値から珠に変換する際の必要数
 */
export const gaugeToJuelLevels = Object.freeze([0, 100, 300, 500, 1500, 3000, 6000, 10000, 30000, 60000, 100000, 150000, 250000])

/**
 * palamToJuelLevelsで指定された数に達したときに得られる珠の数
 */
export const gaugeToJuelAmounts = Object.freeze([0, 1, 2, 10, 20, 100, 200, 500, 1000, 2000, 3000, 5000, 8000])
