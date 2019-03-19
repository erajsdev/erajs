import { TrainDef, Train, TrainStatus, 調教行為実行判定, SourceTable, KeyOfSourceTable, autoFixSources, sourceToGaugeChanges, KeyOfTrainGauge, gaugeToJuel, autoFixTrainSources } from "./train";
import { io } from "../io"
import { getTrainList } from "./trainloader";
import { GameScene, Game } from "../game";
import { serializer } from "../savedata";
import { viewGauge } from "../characterstatus/view";
import { GaugeTable } from "../characterstatus/gauge";
import { tuple, getString, getStringOrError, getOrDefault, constMap } from "../util/tuple";
import { CharacterReference } from "../character";
import { AsyncEvent } from "../util/event";

// とりあえず1対1を実装


export class TrainScene implements GameScene {
    targetIDs: string[]
    playerIDs: string[]
    commanderIDs: string[]
    constructor(public game: Game, data: any) {
        this.commanderIDs = getOrDefault<string[]>(data, "commanderID", [])
        this.playerIDs = getOrDefault<string[]>(data, "playerIDs", [])
        this.targetIDs = getOrDefault<string[]>(data, "targetIDs", [])
        //if (!this.commanderIDs || this.commanderIDs.length === 0)
            //throw new Error("commanderIDが指定されていない")
        if (!this.playerIDs || this.playerIDs.length === 0)
            throw new Error("playerIDsが指定されていない")
        if (!this.targetIDs || this.targetIDs.length === 0)
            throw new Error("targetIDsが指定されていない")
    }

    async beginScene() {
        if (this.playerIDs.length !== 1) throw new Error("playerは一人以外は未実装")
        if (this.targetIDs.length !== 1) throw new Error("targetは一人以外は未実装")
        const train = new Train()
        let player = this.game.characters.tryGet(this.playerIDs[0])
        let target = this.game.characters.tryGet(this.targetIDs[0])
        if (!player || !target) {
            let s = ""
            if (!player) s += " [game.playerCharacterID]"
            if (!target) s += " [game.variables.調教対象]"
            s += "が無効なので調教画面に入れません"
            await io.printError(s.trim())
            this.game.setDefaultFlow()
            return
        }
        train.targets.push(target)
        train.players.push(player)
        
        const lst = await getTrainList()
        while (true) {
            const msg = this.checkTrainable(train)
            if (msg) {
                await io.drawLine()
                await io.printl(`${msg}ので自動的に調教を終了します`)
                await io.wait()
                this.game.setDefaultFlow()
                return
            }

            await io.drawLine()
            await io.printl(`調教者: ${player.呼び名}`)
            await this.viewGauge(player)
            await io.printl(`調教対象: ${target.呼び名}`)
            await this.viewGauge(target)

            await io.drawLine()
            for (const t of lst) {
                await io.printc(`[${t.ID}] ${t.名前}する`)
            }
            for (const t of lst) {
                await io.printc(`[${t.ID+500}] ${t.名前}させる`)
            }
            await io.ensureNewline()
            await io.printl("[999] 終了")
            await io.drawLine()
            const num = await io.inputNumber()
            const isRev = num >= 500
            const t = lst.find(x => isRev ? (x.ID === num-500) : (x.ID === num))
            if (num === 999) {
                await this.finishTrain()
                return
            }
            else if (t) {
                const trainPlayer = !isRev ? player : target
                const trainTarget = !isRev ? target : player
                const trainStatus = t.内容取得(train, trainTarget, trainPlayer, player)
                const approval: [string, number][] = []
                t.許容判定(train, trainTarget, trainPlayer, player, approval)
                const fixedApproval = this.実行判定修整(approval)
                await this.実行判定表示(fixedApproval)
                await io.printw(`${t.名前}を実行`)
                autoFixTrainSources(trainStatus)
                //const playerSource = autoFixSources(trainStatus, trainStatus.実行者ソース, trainStatus.target, trainStatus.player)
                //const targetSource = autoFixSources(trainStatus, trainStatus.対象者ソース, trainStatus.target, trainStatus.player)
                await io.printl("-補正前")
                await this.内容表示(trainStatus)
                await io.printl("-補正後")
                //await this.内容表示(src)
                const gaugep = sourceToGaugeChanges(trainStatus.補正済み実行者ソース, trainStatus.player)
                await io.printl(`調教者: ${trainPlayer.呼び名}`)
                await this.変動表示(gaugep, true)
                const gauget = sourceToGaugeChanges(trainStatus.補正済み対象者ソース, trainStatus.target)
                await io.printl(`調教対象: ${trainTarget.呼び名}`)
                await this.変動表示(gauget, true)

                this.変動加算(trainPlayer.変動, gaugep)
                this.変動加算(trainTarget.変動, gauget)
                await io.wait()
            }
            else {

            }
        }
    }

    async finishTrain() {
        const juels = this.珠取得()
        console.log(juels)
        if (Game.isSceneRegistered("levelup")) {
            this.game.setFlow("levelup", { targetID: this.targetIDs[0] })
        }
        else {
            this.game.setFlow("main", {})
        }
    }

    async viewGauge(c: CharacterReference) {
        await viewGauge(c)
        const keys = tuple(
            "快Ｃ",
            "快Ｐ",
            "快Ｖ",
            "快Ａ",
            "快Ｂ",
            "快Ｍ",
            "潤滑",
            "恭順",
            "欲情",
            "屈服",
            "習得",
            "恥情",
            "苦痛",
            "恐怖",
            "憤慨",
            "不快",
            "抑鬱",
        )
        for (const k of keys) {
            const v = Math.floor(c.変動[k].value)
            await io.printc(`${k}:${v}`)
        }
        await io.printl()
    }

    checkTrainable(train: Train) {
        if (train.players.length === 0 || train.targets.length === 0) {
            let s = ""
            if (train.players.length === 0) s += " 調教者"
            if (train.targets.length === 0) s += " 調教対象"
            s += "が誰もいなくなった"
            return s
        }
        if (!train.players.find(x => x.変動.体力.value > 0)) {
            const 全員 = train.players.length > 1 ? "全員" : ""
            return `調教者${全員}の体力がなくなった`
        }
        if (!train.players.find(x => x.変動.気力.value > 0)) {
            const 全員 = train.players.length > 1 ? "全員" : ""
            return `調教者${全員}の気力がなくなった`
        }
        if (!train.targets.find(x => x.変動.体力.value > 0)) {
            const 全員 = train.targets.length > 1 ? "全員" : ""
            return `調教対象${全員}の体力がなくなった`
        }
        if (!train.targets.find(x => x.変動.気力.value > 0)) {
            const 全員 = train.targets.length > 1 ? "全員" : ""
            return `調教対象${全員}の気力がなくなった`
        }
        return undefined
    }

    実行判定修整(array: [string, number][]) {
        return array
    }

    async 実行判定表示(array: [string, number][]) {
        //const signTbl = ["－", "±", "＋"]
        for (const [name, value] of array) {
            if (Math.abs(value) !== 0) {
                //const sign = signTbl[Math.sign(value) + 1]
                await io.prints(`${name}(${value})`)
            }
        }
        await io.printl()
    }
    async 内容表示(trainData: TrainStatus) {
        let str = ""
        for (const key of KeyOfSourceTable) {
            const val = trainData.実行者ソース[key]
            if (val === 0) continue
            str += `${key}(${val}) `
        }
        str = str.trim()
        await io.printl(`${trainData.player.呼び名}`)
        await io.prints(`　`)
        await io.printl(`${str}`)

        str = ""
        for (const key of KeyOfSourceTable) {
            const val = trainData.対象者ソース[key]
            if (val === 0) continue
            str += `${key}(${val}) `
        }
        str = str.trim()
        await io.printl(`${trainData.target.呼び名}`)
        await io.prints(`　`)
        await io.printl(`${str}`)
    }

    static readonly gaugeNames = tuple(
        "体力",
        "気力",
        "酩酊",
        "快Ｃ",
        "快Ｐ",
        "快Ｖ",
        "快Ａ",
        "快Ｂ",
        "快Ｍ",
        "潤滑",
        "恭順",
        "欲情",
        "屈服",
        "習得",
        "恥情",
        "苦痛",
        "恐怖",
        "憤慨",
        "不快",
        "抑鬱",
    )
    async 変動表示(gauge: GaugeTable, isAdditive: boolean) {
        let s = ""
        for (const key of TrainScene.gaugeNames) {
            const val = gauge[key]
            if (val.value === 0) continue
            s += `${key}${this.toSignedString(Math.floor(val.value))} `
        }
        await io.printl("　"+s.trim())
    }
    toSignedString(n: number) {
        const arr = ["-", "±", "+"]
        return arr[Math.sign(n) + 1]+Math.abs(n)
    }

    変動加算(gauge: GaugeTable, add: GaugeTable) {
        for (const key of TrainScene.gaugeNames) {
            gauge[key].value += add[key].value
        }
    }

    珠取得() {
        const ret: [CharacterReference, [string, number][]][] = []
        const cs = [...this.playerIDs, ...this.targetIDs, ...this.commanderIDs].map(x => this.game.characters.get(x))
        for (const c of cs) {
            const arr: [string,number][] = []
            ret.push([c, arr])
            for (const k of TrainScene.gaugeNames) {
                if (k === "体力") continue
                if (k === "気力") continue
                if (k === "酩酊") continue
                const j = gaugeToJuel(c.変動[k].value)
                if (j === 0) continue
                arr.push([k, j])
                c.スコア[k].value += j
                c.変動[k].value = 0
            }
        }
        return ret
    }

}

export const initializeModule = new AsyncEvent()
initializeModule.addListener(async () => {
    Game.registerSceneClass("train", TrainScene)
})
