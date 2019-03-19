import { CharacterDef } from '../../charadef'
import '../../characterstatus'
import '../../train'

export default () => {
    const キャラ = new CharacterDef()

    キャラ.番号 = 0
    キャラ.名前 = "あなた"
    キャラ.呼び名 = "あなた"
    キャラ.変動.体力.max = 2000
    キャラ.変動.気力.max = 2000
    キャラ.変動.勃起.max = 1000
    キャラ.変動.精力.max = 1000

    キャラ.特性.Ｐ有り = true
    キャラ.特性.Ｖ有り = false
    キャラ.特性.Ｂ有り = false

    return キャラ
}


