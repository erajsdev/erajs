import { io } from "./io";
import { Game, isGameScene, GameScene } from "./game";
import { viewGauge, viewStatus } from "./characterstatus/view";
import { clamp } from "./util/clamp";
import { Gauge } from "./characterstatus/gauge";
import * as project from './project'
import { getCharacterDefList } from "./charadef/charaloader";
import { AsyncEvent } from "./util/event";



class Title implements GameScene {
    constructor(public game: Game, data: any) {
    }

    async beginScene() {
        await io.align('center')
        await io.drawLine()
        await io.printl(`EraJS v.${project.version}`)
        await io.printl("このゲームは18歳未満はプレイ禁止です。")
        await io.drawLine()
        await io.printl("[0] はじめから")
        await io.printl("[1] つづきから")
        await io.align('left')
        const ask = await io.inputNumber()
        if (ask === 0) {
            const charas = await getCharacterDefList()
            console.log(charas)
            const c1 = await this.game.characters.createCharacter(0)
            this.game.playerCharacterID = c1.ID
            const c2 = await this.game.characters.createCharacter(1)
            this.game.variables.選択中のキャラID = [c2.ID]
            this.game.setFlow("main", {})
        }
        else {
            await io.printw("ロードは未実装")
        }
    }
}
Game.registerSceneClass("title", Title)



class Main implements GameScene {
    constructor(public game: Game, data: any) {
    }

    async beginScene() {
        await io.drawLine()
        const p = this.game.characters.get(this.game.playerCharacterID)
        const v = this.game.variables
        await io.printl(`日付：${v.日付.日}日目　所持金：${v.所持金}`)
        await io.printl(`${p.呼び名}`)
        await viewGauge(p)
        const targetChara = this.game.characters.tryGet(this.game.variables.選択中のキャラID[0] || "")
        if (targetChara) {
            await io.printl(`調教対象: ${targetChara.呼び名}`)
            await viewGauge(targetChara)
        }
        else {
            await io.printl(`調教対象: なし`)
        }
        await io.drawLine()

        const f = await io.branch([
            ["調教開始", () => this.game.setFlow("train", {
                playerIDs: [this.game.playerCharacterID],
                targetIDs: this.game.variables.選択中のキャラID
            })],
            ["休憩", () => this.rest(this.game)],
            ["能力表示", () => this.status(this.game)],
            ["対象選択", () => this.selectTarget(this.game)],
            ["アイテムショップ", undefined],
            ["データセーブ", undefined],
            ["データロード", undefined],
            ["設定", undefined],
        ])
        if (f) {
            await f()
        }
    }

    async selectCharacter(game: Game, {
        allowBack = true,
    } = {}) {
        while (true) {
            await io.drawLine()
            await io.printl("対象を選んでください")
            const arr = io.branchBlank<string>()
            await io.drawLine()
            for (const c of game.characters.idOrder) {
                const chara = game.characters.get(c)
                await io.printButton(`${chara.呼び名}`, chara.ID)
                await io.newline()
            }
            await io.drawLine()
            if (allowBack)
                await io.printButton(`戻る`, "")
            await io.newline()
            const id = await io.inputString()
            const c = game.characters.tryGet(id)
            if (c) {
                return c
            }
            else {
                if (allowBack)
                    return
            }
        }
    }

    async selectTarget(game: Game) {
        const chara = await this.selectCharacter(game)
        if (chara) {
            game.variables.選択中のキャラID = [chara.ID]
        }
    }

    async status(game: Game) {
        const chara = await this.selectCharacter(game)
        if (chara) {
            await viewStatus(chara)
            await io.wait()
        }
    }

    async rest(game: Game) {
        const change = (g: Gauge, f: (v: number) => number) => {
            const newval = f(g.value)
            g.value = clamp(newval, g.min, g.max)
        }
        for (const id of game.characters.idOrder) {
            const c = game.characters.get(id)
            change(c.変動.体力, v => v + 1000)
            change(c.変動.気力, v => v + 10000000)
        }
        game.variables.日付.日 += 1
        await io.drawLine()
        await io.printw("休憩しました")
    }
}

export const initializeModule = new AsyncEvent()
initializeModule.addListener(async () => {
    Game.registerSceneClass("main", Main)
})

