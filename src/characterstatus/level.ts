import { savedata, saveclass, serializer } from '../savedata'
import { CharacterDef } from '../charadef'
import { CharactersContainer } from '../character'
import { tuple } from '../util/tuple';
import { AsyncEvent } from '../util/event';
console.log("level")

export const initializeModule = new AsyncEvent()

initializeModule.addListener(async () => {
    CharacterDef.prepareFunctions.push(c => {
        c.レベル = new LevelTable()
    })
    CharactersContainer.prepareFunctions.push((c, d) => {
        if (d) {
            c.レベル = serializer.clone(d.レベル)
        }
        else {
            c.レベル = new LevelTable()
        }
    })
})

/**
 * レベル(旧能力もしくはABL MARK)
 */
@saveclass("leveltable")
export class LevelTable {
    @savedata Ｃ感覚 = 0
    @savedata Ｐ感覚 = 0
    @savedata Ｖ感覚 = 0
    @savedata Ａ感覚 = 0
    @savedata Ｂ感覚 = 0
    @savedata Ｍ感覚 = 0

    @savedata 親密 = 0
    @savedata 従順 = 0
    @savedata 欲望 = 0
    @savedata 技巧 = 0
    @savedata 奉仕精神 = 0
    @savedata 露出癖 = 0
    @savedata マゾっ気 = 0
    @savedata サドっ気 = 0
    @savedata レズっ気 = 0
    @savedata ホモっ気 = 0

    @savedata 自慰中毒 = 0
    @savedata 精液中毒 = 0
    @savedata レズ中毒 = 0
    @savedata ゲイ中毒 = 0
    @savedata 膣射中毒 = 0
    @savedata 肛射中毒 = 0

    @savedata 苦痛刻印 = 0
    @savedata 快楽刻印 = 0
    @savedata 反発刻印 = 0
}

export const KeyOfLevelTable = tuple(
    "Ｃ感覚",
    "Ｐ感覚",
    "Ｖ感覚",
    "Ａ感覚",
    "Ｂ感覚",
    "Ｍ感覚",
    "親密",
    "従順",
    "欲望",
    "技巧",
    "奉仕精神",
    "露出癖",
    "マゾっ気",
    "サドっ気",
    "レズっ気",
    "ホモっ気",
    "自慰中毒",
    "精液中毒",
    "レズ中毒",
    "ゲイ中毒",
    "膣射中毒",
    "肛射中毒",
    "苦痛刻印",
    "快楽刻印",
    "反発刻印",
)


