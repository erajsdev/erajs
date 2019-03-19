import { savedata, saveclass, serializer } from '../savedata'
import { CharacterDef } from '../charadef'
import { CharactersContainer } from '../character'
import { tuple } from '../util/tuple';
import { AsyncEvent } from '../util/event';
console.log("gauge")

export const initializeModule = new AsyncEvent()

initializeModule.addListener(async () => {
    CharacterDef.prepareFunctions.push(c => {
        c.変動 = new GaugeTable()
        c.スコア = new GaugeTable()
    })
    CharactersContainer.prepareFunctions.push((c, d) => {
        if (d) {
            c.変動 = serializer.clone(d.変動)
            c.スコア = serializer.clone(d.スコア)
        }
        else {
            c.変動 = new GaugeTable()
            c.スコア = new GaugeTable()
        }
    })
})

/**
 * 変動(旧基礎もしくはBASE PALAM JUEL)
 */
@saveclass("gaugetable")
export class GaugeTable {
    static extensionInitializer: ((o: GaugeTable) => void)[] = []
    constructor() {
        for (const f of GaugeTable.extensionInitializer) {
            f(this)
        }
    }

    @savedata 体力 = new Gauge()
    @savedata 気力 = new Gauge()
    @savedata 年齢 = new Gauge()
}
/**
 * モジュール側でGaugeTableを拡張したら同時に適宜push()するようにしましょう
 */
export const KeyOfGaugeTable: (keyof GaugeTable)[] = [
    "体力",
    "気力",
    "年齢",
]




/**
 * 変動する値を表現する。
 * 
 * 現在値と最小値と最大値を持ち、範囲内に収めたりチェックしたりする。
 */
@saveclass("gauge")
export class Gauge {
    constructor(value?: number, minValue?: number, maxValue?: number) {
        this.value = (value !== undefined) ? value : 0
        this.min = (minValue !== undefined) ? minValue : 0
        this.max = (maxValue !== undefined) ? maxValue : Number.POSITIVE_INFINITY
    }
    @savedata max = Number.POSITIVE_INFINITY
    @savedata min = 0
    @savedata value = 0
}

