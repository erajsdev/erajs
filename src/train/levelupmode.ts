
import { GameScene, Game } from "../game";
import { makeModuleInitializer } from "../util/moduleInitializer";
import { io } from "../io";
import { getString, getStringOrError } from "../util/tuple";
import { AsyncEvent } from "../util/event";

export const initializeModule = new AsyncEvent()

export class LevelUpScene implements GameScene {
    targetID: string
    constructor(public game: Game, data: any) {
        const targetID = getStringOrError(data, "targetID", "レベルアップ対象がいないので戻ります");
        this.targetID = targetID
    }
    async beginScene() {
        await io.printl("levelup")
        await io.wait()
    }
}
initializeModule.addListener(async () => {
    Game.registerSceneClass("levelup", LevelUpScene)
})

