import "./charaloader"

export class CharacterDef {
    static prepareFunctions: ((c: CharacterDef) => void)[] = []

    constructor() {
        for (const f of CharacterDef.prepareFunctions) {
            f(this)
        }
    }

    番号 = -1
    名前 = "＜名前＞"
    呼び名 = "＜呼び名＞"
}

