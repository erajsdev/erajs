import { CharacterDef } from '.'
import { characterDefList } from './charalist'

let cache: CharacterDef[] | undefined = undefined

/**
 * chara/charalistに記述されたキャラ定義を返す
 */
export const getCharacterDefList = async (): Promise<CharacterDef[]> => {
    if (cache)
        return cache
    const ret: CharacterDef[] = []
    for (const modulePromise of characterDefList) {
        const f = (await modulePromise).default
        ret.push(f())
    }
    cache = ret
    return ret
}


