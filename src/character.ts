import { savedata, saveclass, serializer } from './savedata'
import { uniqueId } from './util'
import { CharacterDef } from './charadef'
import { getCharacterDefList } from './charadef/charaloader'

@saveclass("charactercontainer")
export class CharactersContainer {
    static prepareFunctions: ((c: CharacterReference, cd?: CharacterDef) => void)[] = []

    @savedata idOrder: string[] = []
    @savedata characters = new Map<string, CharacterReference>()

    get(id: string) {
        const c = this.characters.get(id)
        if (!c) throw new Error(`存在しないキャラID '${id}'`)
        return c
    }
    tryGet(id: string) {
        const c = this.characters.get(id)
        return c
    }

    async createCharacter(source?: CharacterDef | number): Promise<CharacterReference> {
        const def = await this.resolveCharaDef(source)
        const idhead = def ? def.名前 : ""
        const c = new CharacterReference()
        c.ID = this.getUnusedID(idhead)
        for (const f of CharactersContainer.prepareFunctions) {
            f(c, def)
        }
        this.characters.set(c.ID, c)
        this.idOrder.push(c.ID)
        return c
    }

    async resolveCharaDef(src: CharacterDef | number | undefined) {
        if (src === undefined) {
            return src
        }
        else if (typeof (src) === 'number') {
            const charas = await getCharacterDefList()
            const ret = charas.find(x => x.番号 === src)
            if (ret === undefined)
                throw new Error(`CharacterDefが見つからない: ${src}`)
            return ret
        }
        else {
            return src
        }
    }

    getUnusedID(name: string): string {
        let loops = 0
        while (true) {
            const id = name+uniqueId()
            loops += 1
            if (loops > 100000)
                throw new Error("much loops")
            if (this.characters.has(id))
                continue
            return id
            break
        }
    }
}

CharactersContainer.prepareFunctions.push((c, d) => {
    if (d) {
        c.番号 = d.番号
        c.名前 = d.名前
        c.呼び名 = d.呼び名
    }
})


@saveclass("unidirectionalrelationship")
export class UnidirectionalRelationship {
    @savedata 相性 = 0
    @savedata 好感度 = 0
    @savedata 恋慕 = false
    @savedata 親愛 = false
    @savedata 淫乱 = false
    @savedata 娼婦 = false
    @savedata 服従 = false
    @savedata 隷属 = false

    static initializers: ((o: UnidirectionalRelationship) => void)[] = []
    constructor() {
        for (const f of UnidirectionalRelationship.initializers) {
            f(this)
        }
    }
}


@saveclass("characterreference")
export class CharacterReference {
    @savedata ID = "＜ID＞"
    @savedata 番号 = -1
    @savedata 名前 = "＜名前＞"
    @savedata 呼び名 = "＜呼び名＞"
    @savedata 関係 = new Map<string, UnidirectionalRelationship>()

    関係取得(c: CharacterReference): UnidirectionalRelationship | undefined
    関係取得(c: CharacterReference, createIfNothing: boolean): UnidirectionalRelationship
    関係取得(c: CharacterReference, createIfNothing = false) {
        if (!c || !c.ID)
            throw new Error(`invalid character: ${(c || {}).ID}`)
        const r = this.関係.get(c.ID)
        if (!r && createIfNothing) {
            const v = new UnidirectionalRelationship()
            this.関係.set(c.ID, v)
            return v
        }
        return r
    }
    
}




