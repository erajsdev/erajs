
import { savedata, saveclass } from '../savedata'
import { CharacterReference } from '../character';
import { getTrainList } from './trainloader';
import { GaugeTable, Gauge, KeyOfGaugeTable } from '../characterstatus/gauge';
import { clamp } from '../util/clamp';
import { ExpTable } from '../characterstatus/exp';
import { StainTable } from '../characterstatus/stain';
import { tuple } from '../util/tuple';
import { expLevels, gaugeLevels, gaugeToJuelAmounts, gaugeToJuelLevels } from './constants';
import { TrainScene } from './trainmode';
import { Game } from '../game';
import { Event, AsyncEvent } from '../util/event';

export const initializeModule = new AsyncEvent()

/**
 * こまかい便利関数
 */
export const 同性判定 = (c1: CharacterReference, c2: CharacterReference) => {
    const c1v = c1.特性.Ｖ有り
    const c2v = c2.特性.Ｖ有り
    if (c1v && c2v)
        return "女"
    else if (!c1v && !c2v)
        return "男"
    else
        return "異性"
}

/**
 * 調教要素を含むもの
 */
export const 調教行為実行判定 = (調教データ: Train, 対象: CharacterReference, 実行者: CharacterReference, array: [string, number][]) => {
    const 項目追加 = (a: string, b: number) => {
        if (b === 0) return
        array.push([a, b])
    }
    
    項目追加(`従順LV${対象.レベル.従順}`, 対象.レベル.従順 * 4)
    項目追加(`マゾっ気LV${対象.レベル.マゾっ気}`, 対象.レベル.マゾっ気 * 2)
    項目追加(`欲望LV${対象.レベル.欲望}`, 対象.レベル.欲望 * 3)
    const 同性 = 同性判定(対象, 実行者)
    if (同性 === "女") {
        項目追加(`レズっ気LV${対象.レベル.レズっ気}`, 対象.レベル.レズっ気 * 3)
        項目追加(`レズ中毒LV${対象.レベル.レズ中毒}`, 対象.レベル.レズ中毒 * 3)
        項目追加(`両刀`, 対象.特性.両刀 ? 10 : 0)
        項目追加(`好奇心`, 対象.特性.好奇心 ? 7 : 0)
        項目追加(`保守的`, 対象.特性.保守的 ? -13 : 0)
    }
    else if (同性 === "男") {
        項目追加(`ホモっ気LV${対象.レベル.ホモっ気}`, 対象.レベル.ホモっ気 * 3)
        項目追加(`ゲイ中毒LV${対象.レベル.ゲイ中毒}`, 対象.レベル.ゲイ中毒 * 3)
        項目追加(`両刀`, 対象.特性.両刀 ? 10 : 0)
        項目追加(`好奇心`, 対象.特性.好奇心 ? 7 : 0)
        項目追加(`保守的`, 対象.特性.保守的 ? -13 : 0)
    }
    else {
        項目追加(`好奇心`, 対象.特性.好奇心 ? 5 : 0)
        項目追加(`保守的`, 対象.特性.保守的 ? -10 : 0)
    }

    項目追加(`苦痛刻印LV${対象.レベル.苦痛刻印}`, 対象.レベル.苦痛刻印 * 5)

    const プライド値 = 対象.特性.プライド高い ? 4 : (対象.特性.プライド低い ? 1 : 2)
    項目追加(`反発刻印LV${対象.レベル.反発刻印}`, 対象.レベル.反発刻印 * -2 * プライド値)

    const 恭順LV = clamp(getGaugeLevel(対象.変動.恭順.value), 0, 5)
    項目追加(`恭順LV${恭順LV}`, 恭順LV * 3)

    const 恐怖LV = clamp(getGaugeLevel(対象.変動.恐怖.value), 0, 5)
    項目追加(`恐怖LV${恐怖LV}`, 恐怖LV * 3)

    項目追加(`服従`, 対象.特性.服従 ? 10 : 0)
    項目追加(`隷属`, 対象.特性.隷属 ? 20 : 0)
    if (!対象.特性.服従) {
        項目追加(`反抗的`, 対象.特性.反抗的 ? -5 : 0)
    }
    項目追加(`気丈`, 対象.特性.気丈 ? -5 : 0)
    項目追加(`素直`, 対象.特性.素直 ? 5 : 0)
    項目追加(`プライド高い`, 対象.特性.プライド高い ? -15 : 0)
    項目追加(`プライド低い`, 対象.特性.プライド低い ? 5 : 0)
    項目追加(`目立ちたがり`, 対象.特性.目立ちたがり ? 2 : 0)
    項目追加(`抑圧`, 対象.特性.抑圧 ? -10 : 0)
    項目追加(`抵抗`, 対象.特性.抵抗 ? -10 : 0)
    項目追加(`弱味`, 対象.特性.弱味 ? 12 : 0)
    項目追加(`即落ち`, 対象.特性.即落ち ? 10 : 0)
    項目追加(`盲信`, 対象.特性.盲信 ? 8 : 0)

    // 場合によっては名前を変えたいだろうから
    const _調教者_ = "調教者"
    項目追加(`${_調教者_}のサドっ気`, 実行者.レベル.サドっ気 * 2)
    項目追加(`${_調教者_}の魅惑`, 実行者.特性.魅惑 ? 6 : 0)
    項目追加(`${_調教者_}の謎の魅力`, 実行者.特性.謎の魅力 ? 8 : 0)
    項目追加(`${_調教者_}のサド`, 実行者.特性.サド ? 3 : 0)
    for (const c of 調教データ.players) {
        if (c === 実行者) continue
        項目追加(`${c.呼び名}の鼓舞`, 実行者.特性.鼓舞 ? 3 : 0)
    }
    const 酩酊LV = getGaugeLevel(対象.変動.酩酊.value)
    項目追加(`酩酊LV${酩酊LV}`, 酩酊LV * 4)

    const 関係 = 対象.関係取得(実行者)
    if (関係) {
        const idx = 相性計算(関係.相性)
        const value = [-10, -6, -3, 0, 3, 6, 10][idx]
        項目追加(相性呼び名[idx], value)
    }
}

export const 相性呼び名 = tuple(`相性最悪`, `相性悪い`, `相性いまいち`, `相性普通`, `相性ややよい`, `相性よい`, `相性最高`)
export const 相性計算 = (n: number) => {
    if (n < -70) {
        return 0
    }
    else if (n < -30) {
        return 1
    }
    else if (n < 0) {
        return 2
    }
    else if (n == 0) {
        return 3
    }
    else if (n < 30) {
        return 4
    }
    else if (n < 70) {
        return 5
    }
    else {
        return 6
    }
}


/**
 * GaugeTableの拡張
 */
declare module '../characterstatus/gauge' {
    interface GaugeTable {
        勃起: Gauge
        射精: Gauge
        精力: Gauge
        快Ｃ: Gauge
        快Ｐ: Gauge
        快Ｖ: Gauge
        快Ａ: Gauge
        快Ｂ: Gauge
        快Ｍ: Gauge
        潤滑: Gauge
        恭順: Gauge
        欲情: Gauge
        屈服: Gauge
        習得: Gauge
        恥情: Gauge
        苦痛: Gauge
        恐怖: Gauge
        憤慨: Gauge
        不快: Gauge
        抑鬱: Gauge
        酩酊: Gauge
    }
}
export const KeyOfTrainGauge = tuple(
    "勃起",
    "射精",
    "精力",
    "酩酊",

    "快Ｃ",
    "快Ｐ",
    "快Ｖ",
    "快Ａ",
    "快Ｂ",
    "快Ｍ",
    "潤滑",
    "恭順",
    "欲情",
    "屈服",
    "習得",
    "恥情",
    "苦痛",
    "恐怖",
    "憤慨",
    "不快",
    "抑鬱",
)
initializeModule.addListener(async () => {
    KeyOfGaugeTable.push(...KeyOfTrainGauge)
    GaugeTable.extensionInitializer.push(o => {
        for (const k of KeyOfTrainGauge) {
            o[k] = new Gauge()
        }
    })
})



/**
 * 経験数の進行段階を得る
 */
export const getExpLevel = (n: number) => {
    for (let i = 0; i < expLevels.length; i++) {
        if (n <= expLevels[i])
            return i
    }
    return gaugeLevels.length
}

/**
 * 変動値の進行段階を得る
 */
export const getGaugeLevel = (n: number) => {
    for (let i = 0; i < gaugeLevels.length; i++) {
        if (n <= gaugeLevels[i])
            return i
    }
    return gaugeLevels.length
}

/**
 * 変動値から取得できるを珠を得る
 */
export const gaugeToJuel = (gaugeValue: number): number => {
    for (let i = 0; i < gaugeToJuelLevels.length; i++) {
        if (gaugeValue <= gaugeToJuelLevels[i])
            return gaugeToJuelAmounts[i]
    }
    return (gaugeValue / 20) | 0
}


/**
 * 快楽系SOURCEの快楽系ABLによる補正 上昇値の倍率うｐに使う
 * 最小1倍 レベルで増幅型
 */
const sourceRev1 = (n: number): number => {
    if (n < 0) {
        return 1
    }
    else if (n >= 0 && n <= 5) {
        return 1 + 0.7 * n
    }
    else if (n >= 6 && n <= 9) {
        return 3 + 0.4 * n
    }
    else if (n >= 10 && n <= 15) {
        return 4.5 + 0.2 * n
    }
    else if (n >= 16 && n <= 19) {
        return 7 + 0.1 * n
    }
    else {
        return 9
    }
}
/**
 * 快楽系sourceに依存する欲望上昇の欲望レベルによる補正
 * 最大1倍 レベルで解放型
 */
const sourceRev2 = (n: number): number => {
    if (n < 0) {
        return 0.25
    }
    else if (n >= 0 && n <= 5) {
        return 0.25 + 0.07 * n
    }
    else if (n >= 6 && n <= 9) {
        return 0.45 + 0.03 * n
    }
    else if (n >= 10 && n <= 15) {
        return 0.6 + 0.02 * n
    }
    else if (n >= 16 && n <= 19) {
        return 0.8 + 0.01 * n
    }
    else {
        return 1
    }
}
/**
 * 普通はない性質を開放するタイプ
 * 最小0倍
 */
const sourceRev3 = (n: number): number => {
    if (n < 0) {
        return 0
    }
    else if (n >= 0 && n <= 5) {
        return 0 + 0.7 * n
    }
    else if (n >= 6 && n <= 9) {
        return 2.25 + 0.4 * n
    }
    else if (n >= 10 && n <= 15) {
        return 4 + 0.2 * n
    }
    else if (n >= 16 && n <= 19) {
        return 6.75 + 0.1 * n
    }
    else {
        return 9
    }
}
const getTable = (n: number, tbl: number[]) => {
    const idx = clamp(n, 0, tbl.length)
    return tbl[idx]
}

export const autoFixTrainSources = (train: TrainStatus) => {
    train.補正済み対象者ソース = autoFixSources(train, train.対象者ソース, train.target)
    train.補正済み実行者ソース = autoFixSources(train, train.実行者ソース, train.player)
}

const getOpponent = <T>(train: TrainStatus, c: CharacterReference, defaultValue: T) => {
    if (train.player === c)
        return train.target
    else if (train.target === c)
        return train.player
    return defaultValue
}

/** 
 * 精神や感度によるソースの補正
 * 対象本人の印象に加工する
 */
export const autoFixSources = (train: TrainStatus, src: SourceTable, self: CharacterReference) => {
    const v = new SourceTable()
    for (const k of KeyOfSourceTable) {
        v[k] = src[k]
    }

    const opponent = getOpponent(train, self, self)

    if (train.commander === self) {
        v.逸脱 = 0
    }
    else {
        v.消耗 *= 2
    }

    if (opponent.特性.サド) {
        const tbl8 = (n: number) => [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 1.2, 1.5][n] || (n / 2 - 2)
        v.被虐 += src.苦痛 * (self.特性.小人 ? 0.75 : 1) * 1.5
    }
    if (opponent.レベル.サドっ気 > 0) {
        const tbl10 = (n: number) => [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5][n] || (n / 2 + 2)

        //v.被虐 += src.恐怖 * tbl10(target.レベル.従順) * 

    }

    //commander === 

    const 潤滑LV = getGaugeLevel(self.変動.潤滑.value)
    const 潤滑係数 = getTable(潤滑LV, [0.1, 0.3, 0.4, 0.75, 0.9, 1])

    v.快Ｃ = src.快Ｃ * sourceRev1(self.レベル.Ｃ感覚)
    {
        const 快Ｖ経験 = getExpLevel(self.経験.Ｖ.快楽)
        const 快Ｖ経験増幅 = getTable(快Ｖ経験, [0.3, 0.5, 0.8, 1, 1.2, 1.5])
        v.快Ｖ = src.快Ｖ * sourceRev1(self.レベル.Ｖ感覚) * 快Ｖ経験増幅 * 潤滑係数
    }
    v.快Ｐ = src.快Ｐ * sourceRev1(self.レベル.Ｐ感覚)
    v.快Ｂ = src.快Ｂ * sourceRev1(self.レベル.Ｂ感覚)
    v.快Ａ = src.快Ａ * sourceRev1(self.レベル.Ａ感覚)
    v.快Ｍ = src.快Ｍ * sourceRev1(self.レベル.Ｍ感覚)


    const 苦痛増幅tbl = (n: number) => [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5][n] || (n / 2 + 2)
    const 苦痛LV = clamp(getGaugeLevel(self.変動.苦痛.value), 0, 10)
    v.苦痛 = v.苦痛 * 苦痛増幅tbl(苦痛LV)


    const 関係 = self.関係取得(opponent)
    if (関係) {
        if (関係.親愛) {
            v.屈従 *= 3
            v.恭順 *= 3
            v.親交 *= 3
            v.情愛 *= 3
            v.鬱屈 *= 0.3
            v.恐怖 *= 0.3
            v.逸脱 *= 0.3
            v.不潔 *= 0.2
        }
        else if (関係.恋慕) {
            v.屈従 *= 2
            v.恭順 *= 2
            v.親交 *= 2
            v.情愛 *= 2
            v.鬱屈 *= 0.5
            v.恐怖 *= 0.5
            v.逸脱 *= 0.5
            v.不潔 *= 0.5
        }

        if (関係.娼婦) {
            v.屈従 *= 1.5
            v.恭順 *= 1.5
            v.情愛 *= 1.5
            v.性行動 *= 1.5
            v.性的 *= 1.5
            v.不潔 *= 0.6
            v.鬱屈 *= 0.6
            v.逸脱 *= 0.3
        }
        else if (関係.淫乱) {
            v.屈従 *= 1.2
            v.恭順 *= 1.2
            v.情愛 *= 1.2
            v.性行動 *= 1.2
            v.性的 *= 1.2
            v.不潔 *= 0.8
            v.鬱屈 *= 0.8
            v.逸脱 *= 0.4
        }

        if (関係.隷属) {
            v.屈従 *= 5
            v.恭順 *= 0.2
            v.親交 *= 0.25
            v.情愛 *= 0.25
            v.恐怖 *= 3
            v.逸脱 *= 0.25
            v.鬱屈 *= 0.25
            v.不潔 *= 0.25
        }
        else if (関係.服従) {
            v.屈従 *= 3
            v.恭順 *= 0.5
            v.親交 *= 0.5
            v.情愛 *= 0.5
            v.恐怖 *= 1.5
            v.逸脱 *= 0.5
            v.鬱屈 *= 0.5
            v.不潔 *= 0.5
        }

        if (関係.相性 !== 0) {
            const R = clamp(1 - 関係.相性, 0.00001, 10000)
            v.欲情 *= R
            v.屈従 *= R
            v.恥辱 *= R
            v.情愛 *= R
            v.親交 *= R
            v.恭順 *= R

            v.逸脱 /= R
            v.鬱屈 /= R
            v.不潔 /= R
        }

        if (self.変動.気力.value <= 0) {
            const R = 0.7
            v.欲情 *= R
            v.屈従 *= R
            v.恥辱 *= R
            v.情愛 *= R
            v.親交 *= R
            v.恭順 *= R
            v.恐怖 *= R
            v.鬱屈 *= R
            v.疲労 *= 1.5
        }
    }

    

    return v
}



/**
 * ソースから変動値への変換
 */
export const sourceToGaugeChanges = (src: SourceTable, target: CharacterReference) => {
    const v = new GaugeTable()

    v.体力.value -= src.疲労
    v.気力.value -= src.消耗

    {
        // 快Ｃ
        const 欲情LV = getGaugeLevel(target.変動.欲情.value)
        const 欲情増幅 = getTable(欲情LV, [0.8, 0.8, 0.8, 1, 1, 1.2, 1.2, 1.4, 1.4, 1.6])
        v.快Ｃ.value += src.快Ｃ * 欲情増幅
        v.欲情.value += src.快Ｃ * 欲情増幅 * sourceRev2(target.レベル.欲望)
    }
    {
        // 快Ｂ
        const 欲情LV = getGaugeLevel(target.変動.欲情.value)
        const 欲情増幅 = getTable(欲情LV, [0.8, 0.8, 0.8, 1, 1, 1.2, 1.2, 1.4, 1.4, 1.6])
        v.快Ｂ.value += src.快Ｂ * 欲情増幅
        v.欲情.value += src.快Ｂ * 欲情増幅 * sourceRev2(target.レベル.欲望)
    }
    {
        // 快Ｐ
        const 欲情LV = getGaugeLevel(target.変動.欲情.value)
        const 欲情増幅 = getTable(欲情LV, [0.8, 0.8, 0.8, 1, 1, 1.2, 1.2, 1.4, 1.4, 1.6])
        const val = src.快Ｐ * 欲情増幅
        v.快Ｐ.value += val
        v.欲情.value += val * sourceRev2(target.レベル.欲望)
        v.射精.value += val * sourceRev2(target.レベル.欲望)
    }
    {
        // 快Ｖ
        const 欲情 = getGaugeLevel(target.変動.欲情.value)
        const 欲情増幅 = getTable(欲情, [0.6, 0.6, 0.8, 0.8, 1, 1, 1.2, 1.2, 1.5])
        const 補正1 = target.特性.小人 ? 0.8 : 1
        const 補正2 = target.特性.小人 ? 1.2 : 1
        v.快Ｖ.value += src.快Ｖ * 欲情増幅 * 補正1
        v.欲情.value += src.快Ｖ * sourceRev2(target.レベル.欲望) * 補正2
    }
    {
        // 快Ａ
        const 欲情 = getGaugeLevel(target.変動.欲情.value)
        const 欲情増幅 = getTable(欲情, [0.6, 0.6, 0.8, 0.8, 1, 1, 1.2, 1.2, 1.5])
        const 補正1 = target.特性.小人 ? 0.8 : 1
        const 補正2 = target.特性.小人 ? 1.2 : 1
        v.快Ａ.value += src.快Ａ * 欲情増幅 * 補正1
        v.欲情.value += src.快Ａ * sourceRev2(target.レベル.欲望) * 補正2
    }
    {
        // 快Ｍ
        const 欲情LV = getGaugeLevel(target.変動.欲情.value)
        const 欲情増幅 = getTable(欲情LV, [0.8, 0.8, 0.8, 1, 1, 1.2, 1.2, 1.4, 1.4, 1.6])
        v.快Ｍ.value += src.快Ｍ * 欲情増幅
        v.欲情.value += src.快Ｍ * 欲情増幅 * sourceRev2(target.レベル.欲望)
    }

    //情愛
    const tbl1 = (n: number) => [0.1, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5][n] || (n / 2 + 1)
    v.恭順.value += src.情愛 * tbl1(target.レベル.従順)
    const tbl2 = (n: number) => [0.1, 0.4, 0.8, 1.2, 1.6, 2, 2.4, 2.8, 3.2, 3.6][n] || (n / 2 - 1)
    v.欲情.value += src.情愛 * tbl2(target.レベル.欲望)

    //性行動
    const tbl3 = (n: number) => [0.6, 1.2, 1.8, 2.4, 3, 3.6, 4.2, 4.8, 5.4, 6][n] || (n / 2 + 2)
    const tbl4 = (n: number) => [0.6, 0.8, 1, 1.2, 1.4, 1.7, 2, 2.4, 2.8, 4][n] || (n / 2)
    v.習得.value += src.性行動 * tbl3(target.レベル.技巧) * tbl4(target.レベル.奉仕精神)

    //達成
    const tbl5 = (n: number) => [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5][n] || (n / 2 + 1)
    const tbl6 = (n: number) => [0.1, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5][n] || (n / 2 + 1)
    v.恭順.value += src.達成 * tbl5(target.レベル.従順) * tbl6(target.レベル.奉仕精神)

    //苦痛
    const hpRatio = target.変動.体力.value / target.変動.体力.max
    const hpLevel = clamp(Math.floor(hpRatio * 10), 0, 10)
    const tbl7 = (n: number) => [2.5, 2.5, 2.5, 2.5, 2.2, 2, 1.8, 1.6, 1.4, 1.2, 1][clamp(n, 0, 10)]
    const tbl8 = (n: number) => [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 1.2, 1.5][n] || (n / 2 - 2)
    const tbl9 = (n: number) => [1, 1.2, 1.5, 2][n] || 1
    v.苦痛.value += src.苦痛 * tbl7(hpLevel) * (target.特性.小人 ? 2 : 1) * (target.特性.痛みに弱い ? 1.5 : 1)
    v.欲情.value += src.苦痛 * tbl8(target.レベル.マゾっ気) * (target.特性.小人 ? 0.75 : 1)
    v.恐怖.value += src.苦痛 * tbl9(target.レベル.苦痛刻印) * (target.特性.臆病 ? 2 : 1)

    //被虐
    v.欲情.value += src.被虐 * tbl8(target.レベル.マゾっ気)

    //恐怖
    const tbl10 = (n: number) => [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5][n] || (n / 2 + 2)
    v.恐怖.value += src.恐怖 * tbl10(target.レベル.従順)
    v.屈服.value += src.恐怖
    //v.憤慨.value += src.逸脱

    //中毒
    const tbl11 = (n: number) => [0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2][n] || (n / 4 + 0.5)
    const tbl12 = (n: number) => [0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3][n] || (n / 4 + 0.5)
    v.恭順.value += src.中毒 * tbl11(target.レベル.欲望)
    v.欲情.value += src.中毒 * tbl12(target.レベル.欲望)

    //欲情
    v.欲情.value += src.欲情 * tbl2(target.レベル.欲望)

    //恭順
    const tbl13 = (n: number) => [0.8, 1.2, 1.6, 2, 2.4, 2.8, 3.2, 3.6, 4, 4.4][n] || (n / 2 + 1)
    const tbl14 = (n: number) => [1, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.4, 3.7][n] || (n / 2 + 1)
    v.恭順.value += src.恭順 * tbl13(target.レベル.従順) * tbl14(target.レベル.欲望)

    //露出
    const tbl15 = (n: number) => [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6][n] || 1
    const tbl16 = (n: number) => [1, 0.9, 0.8, 0.7, 0.6][n] || 1
    const 恥情LV = getGaugeLevel(target.変動.恥情.value)
    v.欲情.value += src.露出 * tbl15(target.レベル.露出癖)
    v.恥情.value += src.露出 * tbl16(恥情LV)
    v.屈服.value += src.露出 * tbl16(恥情LV) * 0.1

    //屈従
    const tbl17 = (n: number) => [0.5, 1, 1.5, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6][n] || 1
    v.屈服.value += src.屈従 * tbl17(target.レベル.従順) * tbl17(target.レベル.奉仕精神)

    //不潔
    const tbl18 = (n: number) => [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0][n] || 1
    const 汚れ係数 = (target.特性.汚れ無視 ? 0.5 : 1) * (target.特性.潔癖症 ? 2 : 1)
    v.不快.value += src.不潔 * tbl18(target.レベル.従順) * 汚れ係数

    //鬱屈
    const tbl19 = (n: number) => [1, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.08, 0.06, 0.04, 0][n] || 1
    v.抑鬱.value += src.鬱屈 * tbl19(target.レベル.従順) * tbl19(target.レベル.欲望)

    //逸脱
    const 逸脱係数 = (target.特性.好奇心 ? 0.8 : 1) * (target.特性.保守的 ? 2 : 1)
    const tbl20 = (n: number) => [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5][n] || 1
    v.憤慨.value += src.逸脱 * 逸脱係数 * tbl19(target.レベル.従順) * tbl20(target.レベル.マゾっ気)

    return v
}


const applyGaugeTable = (applyTo: GaugeTable, value: GaugeTable) => {
    const keys = tuple(
        "体力",
        "気力",
        ...KeyOfTrainGauge
    )
    for (const k of keys) {
        const g = applyTo[k]
        g.value = clamp(g.value + value[k].value, g.min, g.max)
    }
}




export const KeyOfTrainContextAttribute = tuple("無自覚")
export type TrainContextAttribute = typeof KeyOfTrainContextAttribute[number]

export class Train {
    previousTrain: TrainDef | undefined
    players: CharacterReference[] = []
    targets: CharacterReference[] = []
    exitTrain = false
    attributes = new Attributes<TrainContextAttribute>()

    async doTrain() {
        await this.prepareTrain()
        while (await this.stepTrain()) { }
        await this.finishTrain()
    }

    private async prepareTrain() {
    }
    private async stepTrain() {
        const trains = await getTrainList()

        return this.exitTrain
    }
    private async finishTrain() {
    }

    playersName() {
        if (this.players.length === 0)
            return "<誰もいない>"
        else if (this.players.length > 1)
            return `${this.players[0].呼び名}達`
        else
            return `${this.players[0].呼び名}`
    }
    targetsName() {
        if (this.targets.length === 0)
            return "<誰もいない>"
        else if (this.targets.length > 1)
            return `${this.targets[0].呼び名}達`
        else
            return `${this.targets[0].呼び名}`
    }
}
/*
export class TrainCharacterContextList {
    leader: CharacterReference | undefined = undefined
    contexts: TrainCharacterContext[] = []

    呼び名() {
        if (this.leader === undefined)
            return "<undefined>"
        if (this.contexts.length > 1)
            return `${this.leader.呼び名}達`
        else
            return `${this.leader.呼び名}`
    }
}
export interface TrainCharacterContext {
    player: CharacterReference
    target: CharacterReference
    source: SourceTable
}
*/

@saveclass("trainstatus")
export class TrainStatus {
    constructor(target: CharacterReference, player: CharacterReference, commander: CharacterReference) {
        this.player = player
        this.target = target
        this.commander = commander
    }

    commander: CharacterReference
    命令者ソース = new SourceTable()
    補正済み命令者ソース = new SourceTable()
    commanderExp = new ExpTable()
    commanderStain = new StainTable()

    target: CharacterReference
    対象者ソース = new SourceTable()
    補正済み対象者ソース = new SourceTable()
    targetExp = new ExpTable()
    targetStain = new StainTable()

    player: CharacterReference
    実行者ソース = new SourceTable()
    補正済み実行者ソース = new SourceTable()
    playerExp = new ExpTable()
    playerStain = new StainTable()

    attributes = new Attributes<TrainAttribute>()
    bodyTouch = new TouchStatus()

    属性追加(name: TrainAttribute) {
        this.attributes.add(name)
    }
    接触追加(c1: CharacterReference, p1: TouchPart, c2: CharacterReference, p2: TouchPart) {
        this.bodyTouch.set(c1, p1, c2, p2)
    }
}


export const KeyOfTouchPart = tuple("Ａ", "Ｖ", "Ｂ", "Ｍ", "Ｐ", "Ｃ", "手", "腋", "顔", "髪", "腹", "太もも", "割れ目", "尻", "子宮内")
export type TouchPart = typeof KeyOfTouchPart[number]

/**
 * 体の触れ合いを示す。
 * 触れた部位同士を記憶し、一括して返す。
 * 
 * 主に汚れシステム
 * 射精したときにがＰが触れている場所が精液に塗れたり、キスすると口同士で汚れが移るなどに使われる
 */
export class TouchStatus {
    data: [CharacterReference, TouchPart, CharacterReference, TouchPart][] = []

    set(c1: CharacterReference, c1part: TouchPart, c2: CharacterReference, c2part: TouchPart) {
        this.data.push([c1, c1part, c2, c2part])
    }

    getList(c: CharacterReference, part: TouchPart) {
        const ret: [CharacterReference, TouchPart][] = []
        for (const [c1, c1part, c2, c2part] of this.data) {
            if (c1 === c && c1part === part) {
                ret.push([c2, c2part])
            }
            if (c2 === c && c2part === part) {
                ret.push([c1, c1part])
            }
        }
        return ret
    }

    isTouchedBoth(pc1: CharacterReference, pc1part: TouchPart, pc2: CharacterReference, pc2part: TouchPart) {
        for (const [c1, c1part, c2, c2part] of this.data) {
            if ((c1 === pc1 && c1part === pc1part && c2 === pc2 && c2part === pc2part) ||
                (c1 === pc2 && c1part === pc2part && c2 === pc1 && c2part === pc1part)) {
                return true
            }
        }
        return false
    }

    isTouched(c: CharacterReference, cpart: TouchPart) {
        for (const [c1, c1part, c2, c2part] of this.data) {
            if ((c1 === c && c1part === cpart) || (c2 === c && c2part === cpart)) {
                return true
            }
        }
        return false
    }
}


export const KeyOfSourceTable = tuple(
    "疲労",
    "消耗",
    "快Ｃ",
    "快Ｐ",
    "快Ｖ",
    "快Ａ",
    "快Ｂ",
    "快Ｍ",
    "快Ｕ",
    "液体",
    "情愛",
    "性行動",
    "達成",
    "苦痛",
    "被虐",
    "恐怖",
    "欲情",
    "恭順",
    "露出",
    "屈従",
    "歓楽",
    "征服",
    "受動",
    "性的",
    "不潔",
    "鬱屈",
    "逸脱",
    "誘惑",
    "恥辱",
    "挑発",
    "奉仕",
    "強要",
    "加虐",

    "親交",
)
export type SourceType = typeof KeyOfSourceTable[number]
@saveclass("sourcetable")
export class SourceTable {
    @savedata 疲労 = 0
    @savedata 消耗 = 0

    @savedata 快Ｃ = 0
    @savedata 快Ｐ = 0
    @savedata 快Ｖ = 0
    @savedata 快Ａ = 0
    @savedata 快Ｂ = 0
    @savedata 快Ｍ = 0
    @savedata 快Ｕ = 0

    @savedata 液体 = 0
    @savedata 情愛 = 0
    @savedata 性行動 = 0
    @savedata 達成 = 0
    @savedata 苦痛 = 0
    @savedata 被虐 = 0
    @savedata 恐怖 = 0
    @savedata 欲情 = 0
    @savedata 恭順 = 0
    @savedata 露出 = 0
    @savedata 屈従 = 0
    @savedata 歓楽 = 0
    @savedata 征服 = 0
    @savedata 受動 = 0
    @savedata 性的 = 0

    @savedata 不潔 = 0
    @savedata 鬱屈 = 0
    @savedata 逸脱 = 0

    @savedata 誘惑 = 0
    @savedata 恥辱 = 0
    @savedata 挑発 = 0
    @savedata 奉仕 = 0
    @savedata 強要 = 0
    @savedata 加虐 = 0


    @savedata 中毒 = 0

    @savedata 親交 = 0

}


export class Attributes<T> {
    private container = new Set<T>()

    add(...names: T[]) {
        for (const n of names) {
            this.container.add(n)
        }
    }
    has(name: T) {
        return this.container.has(name)
    }

    values() {
        return [...this.container.keys()]
    }
}

export const KeyOfTrainAttribute = tuple(
    "調教", "エロ",
    "Ａ", "Ｖ", "Ｂ", "Ｍ", "Ｐ", "Ｃ",
    "性交", "キス", "妊娠", "前戯", "愛撫",
    "日常", "会話")
export type TrainAttribute = typeof KeyOfTrainAttribute[number]

export class TrainDef {
    ID = -1
    名前 = "＜未設定＞"
    属性 = new Attributes<TrainAttribute>()
    発動条件 = (train: Train, target: CharacterReference, player: CharacterReference, commander: CharacterReference) => true
    許容判定 = (train: Train, target: CharacterReference, player: CharacterReference, commander: CharacterReference, array: [string, number][]) => { array.push(["未設定", 100]) }
    内容取得 = (train: Train, target: CharacterReference, player: CharacterReference, commander: CharacterReference): TrainStatus => new TrainStatus(target, player, commander)
}
