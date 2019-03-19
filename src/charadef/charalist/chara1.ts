import { CharacterDef } from '../../charadef'
import '../../characterstatus'
import '../../train'

export default () => {
    const キャラ = new CharacterDef()

    キャラ.番号 = 1
    キャラ.名前 = "博麗 霊夢"
    キャラ.呼び名 = "霊夢"
    キャラ.変動.体力.max = 1500
    キャラ.変動.気力.max = 1500
    キャラ.変動.勃起.max = 1000
    キャラ.変動.精力.max = 1000
    キャラ.レベル.レズっ気 = 1

    キャラ.特性.処女 = true

    return キャラ
}

