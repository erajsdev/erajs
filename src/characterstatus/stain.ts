import { saveclass, savedata, serializer } from "../savedata";
import { CharacterDef } from "../charadef";
import { CharactersContainer } from "../character";
import { AsyncEvent } from "../util/event";

export const initializeModule = new AsyncEvent()

initializeModule.addListener(async () => {
    CharacterDef.prepareFunctions.push(c => {
        c.汚れ = new StainTable()
    })
    CharactersContainer.prepareFunctions.push((c, d) => {
        if (d) {
            c.汚れ = serializer.clone(d.汚れ)
        }
        else {
            c.汚れ = new StainTable()
        }
    })
})


export enum StainType {
    Ｖ,
    Ｐ,
    Ａ,
    愛液,
    精液,
    粘液,
    ローション,
    母乳,
    破瓜の血,
}


@saveclass("stain")
export class Stain {
    @savedata private contents = new Set<StainType>()

    static blendEach(...stains: Stain[]) {
        for (const s1 of stains) {
            for (const s2 of stains) {
                if (s1 === s2) continue
                s1.setFrom(s2)
            }
        }
    }

    clear() {
        this.contents.clear()
    }
    has(t: StainType) {
        return this.contents.has(t)
    }
    set(t: StainType) {
        this.contents.add(t)
    }
    setFrom(t: Stain) {
        t.contents.forEach((v) => this.set(v))
    }
    remove(t: StainType) {
        this.contents.delete(t)
    }
    blend(t: Stain): Stain {
        const ret = new Stain()
        ret.setFrom(this)
        ret.setFrom(t)
        return ret
    }
}

@saveclass("staintable")
export class StainTable {
    @savedata Ｖ = new Stain()
    @savedata Ｂ = new Stain()
    @savedata Ｐ = new Stain()
    @savedata Ａ = new Stain()
    @savedata Ｍ = new Stain()
    @savedata 手 = new Stain()
    @savedata 膣内 = new Stain()
    @savedata 腸内 = new Stain()
}

