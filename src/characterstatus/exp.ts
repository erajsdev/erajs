import { savedata, saveclass, serializer } from '../savedata'
import { CharacterDef } from '../charadef'
import { CharactersContainer, UnidirectionalRelationship } from '../character'
import { tuple } from '../util/tuple';
import { AsyncEvent } from '../util/event';
console.log("exp")

export const initializeModule = new AsyncEvent()

initializeModule.addListener(async () => {
    CharacterDef.prepareFunctions.push(c => {
        c.経験 = new ExpTable()
    })
    CharactersContainer.prepareFunctions.push((c, d) => {
        if (d) {
            c.経験 = serializer.clone(d.経験)
        }
        else {
            c.経験 = new ExpTable()
        }
    })
})


declare module '../character' {
    interface UnidirectionalRelationship {
        受けた経験: ExpTable
    }
}
initializeModule.addListener(async () => {
    UnidirectionalRelationship.initializers.push(o => {
        o.受けた経験 = new ExpTable()
    })
})



/**
 * 部位ごとの経験
 */
@saveclass("partexp")
export class PartExp {
    @savedata 快楽 = 0
    @savedata 無自覚快楽 = 0
    @savedata 自慰 = 0
    @savedata 拡張 = 0
    @savedata Ｐ挿入 = 0
    @savedata 絶頂 = 0
    @savedata 無自覚絶頂 = 0
    @savedata 精液 = 0
    @savedata キス = 0
}
export const KeyOfPartExp: (keyof PartExp)[] = tuple(
    "快楽", "無自覚快楽",
    "絶頂", "無自覚絶頂",
    "自慰", "拡張", "Ｐ挿入", "精液", "キス",
)
export const isPartExp = (o: any): o is PartExp => {
    if (typeof(o) !== 'object')
        return false
    for (const k in KeyOfPartExp) {
        if (typeof (o[k]) !== 'number')
            return false
    }
    return true
}



/*
interface BodyPart<T> {
    Ｃ: T
    Ｐ: T
    Ｖ: T
    Ａ: T
    Ｂ: T
    Ｍ: T
}
*/


/**
 * 受動および自動経験(旧EXP)
 * 
 * 関係にも使う。つまり誰に何をされたとかも統計取る
 * 逆方向を調べれば誰に何をしたかを知ることができる。そっちは頻度が少なそうなので今のところいちいち計算する
 */
@saveclass("exptable")
export class ExpTable {
    @savedata Ｃ = new PartExp()
    @savedata Ｐ = new PartExp()
    @savedata Ｖ = new PartExp()
    @savedata Ａ = new PartExp()
    @savedata Ｂ = new PartExp()
    @savedata Ｍ = new PartExp()
    @savedata 手淫 = 0
    @savedata 口淫 = 0
    @savedata パイズリ = 0
    @savedata 絶頂 = 0
    @savedata 射精 = 0
    @savedata 噴乳 = 0
    @savedata 放尿 = 0
    @savedata 精液 = 0
    @savedata 精飲 = 0
    @savedata 膣射 = 0
    @savedata 肛射 = 0
    @savedata キス = 0
    @savedata 調教 = 0
    @savedata レズ = 0
    @savedata ゲイ = 0

    @savedata 奉仕快楽 = 0
    @savedata 苦痛快楽 = 0
    @savedata 嗜虐快楽 = 0
    @savedata 露出快楽 = 0
    @savedata 愛情 = 0
}
export const KeyOfExpTable = tuple(
    "Ｃ", "Ｐ", "Ｖ", "Ａ", "Ｂ", "Ｍ",
    "手淫", "口淫", "パイズリ",
    "絶頂", "射精", "噴乳", "放尿", "精液", "精飲", "膣射", "肛射", "キス",
    "調教", "レズ", "ゲイ",
    "奉仕快楽", "苦痛快楽", "嗜虐快楽", "露出快楽", "愛情",
)
export const isExpTable = (o: any): o is ExpTable => {
    if (typeof(o) !== 'object')
        return false
    for (const k in KeyOfExpTable) {
        if (o[k] === undefined)
            return false
    }
    return true
}


