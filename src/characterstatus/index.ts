/**
 * この階層内のモジュールをすべて読み込む
 */
import { CharacterReference } from "../character"
import { CharacterDef } from '../charadef'
import { ExpTable } from "./exp"
import { GaugeTable } from "./gauge"
import { TraitTable } from "./trait"
import { LevelTable } from "./level"
import { StainTable } from "./stain";
import './view'
import { AsyncEvent } from '../util/event';
import { makeModuleInitializer } from '../util/moduleInitializer';

console.log("characterstatus")


export interface CharacterValues {
    経験: ExpTable
    変動: GaugeTable
    スコア: GaugeTable
    特性: TraitTable
    レベル: LevelTable
    汚れ: StainTable
}

declare module '../character' {
    interface CharacterReference extends CharacterValues {
    }
}
declare module '../charadef' {
    interface CharacterDef extends CharacterValues {
    }
}


export const initializeModule = makeModuleInitializer(
    import('./exp'),
    import('./gauge'),
    import('./level'),
    import('./stain'),
    import('./trait'),
)




