/**
 * このモジュールはいわばほかのすべてのモジュールのまとめ役で、C#で言えば外部DLLをリフレクションで呼び出しまくる場所。
 * 
 * ほかのモジュールの関数を、型定義上は依存せずにエラー無く呼び出すことがお仕事
 */

import { io } from "./io"
import { CharactersContainer } from './character'
import { Variables } from './variables'
import { saveclass, savedata, serializer } from './savedata'



export interface GameScene {
    beginScene(): Promise<void>
}
export interface GameSceneConstructor {
    new(game: Game, data: any): GameScene
}
export const isGameScene = (o: any): o is GameScene => {
    if (o && o.beginScene && typeof (o.beginScene) === 'function')
        return true
    else
        return false
}



/**
 * シーン制御兼根源オブジェクト
 */
@saveclass("game")
export class Game {
    static serializer = serializer

    @savedata characters = new CharactersContainer()
    @savedata currentFlow = "title"
    @savedata currentFlowData: any = null
    @savedata variables = new Variables()
    @savedata playerCharacterID = ""

    static readonly prepareFunctions: ((c: Game) => void)[] = []
    static defaultScene = "main"

    private static sceneMap: { [k: string]: GameSceneConstructor } = {}


    setFlow(name: string, data: any) {
        this.currentFlow = name
        this.currentFlowData = JSON.parse(JSON.stringify(data))
    }
    setDefaultFlow() {
        this.setFlow(Game.defaultScene, {})
    }

    serialize() {
        return serializer.serialize(this)
    }
    serializeObj() {
        return serializer.convertToSerializableData(this)
    }


    static registerSceneClass(name: string, sceneClass: GameSceneConstructor) {
        if (Game.sceneMap[name])
            throw new Error("overlapped scene: " + name)
        Game.sceneMap[name] = sceneClass
    }

    static isSceneRegistered(name: string) {
        return Game.sceneMap[name] ? true : false
    }

    static async run(game: Game) {
        while (true) {
            const f = Game.sceneMap[game.currentFlow]
            if (!f) {
                await io.printError(`エラー！ currentFlowが不正な値になっている: ${game.currentFlow}`)
                await io.wait()
                game.currentFlow = Game.defaultScene
                await io.printError(`シーン'${Game.defaultScene}'に戻ります`)
                await io.wait()
                continue;
            }
            //try {
                const scene = new f(game, game.currentFlowData)
            await scene.beginScene()
            await io.waitTime(1)
            //}
            //catch (e) {
                //await io.printError("" + e)
                //game.setDefaultFlow()
            //}
        }
    }

}

