import { savedata, saveclass, serializer } from '../savedata'
import { CharacterDef } from '../charadef'
import { CharactersContainer } from '../character'
import { AsyncEvent } from '../util/event';
console.log("trait")

export const initializeModule = new AsyncEvent()

initializeModule.addListener(async () => {
    CharacterDef.prepareFunctions.push(c => {
        c.特性 = new TraitTable()
    })
    CharactersContainer.prepareFunctions.push((c, d) => {
        if (d) {
            c.特性 = serializer.clone(d.特性)
        }
        else {
            c.特性 = new TraitTable()
        }
    })
})


/**
 * 特性(旧素質もしくはTALENT)
 * 
 * Emueraで用途が逸れていったTALENTと違いbooleanしか持たない。
 * 旧TALENTでenum的な使い方がされてしまったのは、プロパティ関数的な存在がなかった、もしくは非常に手が届きにくかったから。
 * 作ったとしても必ずグローバル関数にせざるを得ない事情もあった。
 * ここではそういうことはない。そういう使い方を望むなら独自関数をexport定義するなりするべし
 */
@saveclass("traittable")
export class TraitTable {
    @savedata 処女 = false
    @savedata 童貞 = false

    // 体の特徴
    @savedata Ｐ有り = false
    @savedata Ｖ有り = true
    @savedata Ｂ有り = true
    @savedata Ｃ有り = true
    /*
    人外も作りたいならこんな感じ
    @savedata Ａ有り = true
    @savedata Ｍ有り = true
    @savedata 尻尾有り = false
    @savedata 卵管有り = false
    @savedata 耳有り = true
    @savedata 触手有り = false
    @savedata はね有り = false
    @savedata 毛皮有り = false
    */

    @savedata 小人 = false
    @savedata 幼児体型 = false
    @savedata 小柄 = false
    @savedata 長身 = false
    @savedata 巨躯 = false
    @savedata 巨人 = false

    @savedata 巨乳 = false
    @savedata 貧乳 = false
    @savedata 爆乳 = false
    @savedata 絶壁 = false
    @savedata 巨根 = false
    @savedata 短小 = false


    //
    @savedata 恋慕 = false
    @savedata 親愛 = false
    @savedata 淫乱 = false
    @savedata 娼婦 = false
    @savedata 服従 = false
    @savedata 隷属 = false

    @savedata 醜悪 = false
    @savedata 容姿端麗 = false

    //
    @savedata 臆病 = false
    @savedata 気丈 = false
    @savedata 素直 = false
    @savedata 反抗的 = false
    @savedata 大人しい = false
    @savedata 生意気 = false
    @savedata プライド低い = false
    @savedata プライド高い = false
    @savedata ツンデレ = false
    @savedata マゾ = false
    @savedata サド = false

    @savedata 自制心 = false
    @savedata 無関心 = false
    @savedata 感情乏しい = false
    @savedata 保守的 = false
    @savedata 好奇心 = false
    @savedata 陰気 = false
    @savedata 陽気 = false
    @savedata 一線越えない = false
    @savedata 目立ちたがり = false
    @savedata 無知 = false

    @savedata 貞操無頓着 = false
    @savedata 貞操観念 = false
    @savedata 抑圧 = false
    @savedata 解放 = false
    @savedata 抵抗 = false
    @savedata 恥薄い = false
    @savedata 恥じらい = false
    @savedata 弱味 = false
    @savedata 痛みに強い = false
    @savedata 痛みに弱い = false
    @savedata 濡れにくい = false
    @savedata 濡れやすい = false
    @savedata 習得遅い = false
    @savedata 習得早い = false
    @savedata 器用な指 = false
    @savedata 舌使い = false
    @savedata 針さばき = false
    @savedata 猫舌 = false
    @savedata 調合知識 = false
    @savedata 薬毒耐性 = false
    @savedata おもらし癖 = false

    @savedata 両刀 = false
    @savedata 即落ち = false
    @savedata 盲信 = false
    @savedata 魅惑 = false
    @savedata 謎の魅力 = false
    @savedata 鼓舞 = false

    @savedata 汚れ無視 = false
    @savedata 潔癖症 = false
    
}



