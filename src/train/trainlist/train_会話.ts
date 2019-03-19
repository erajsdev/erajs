/**
 * 親交行動ＬＶ１
 */
import { TrainDef, Train, SourceTable, TrainStatus, 同性判定, getGaugeLevel, 調教行為実行判定 } from "../train";

const train = new TrainDef()
export default train

train.ID = 101
train.名前 = "会話"
train.属性.add("日常", "会話")

train.発動条件 = (ctx, target, player, commander) => {
    return true
}

train.許容判定 = (ctx, target, player, commander, array) => {
    array.push([train.名前, 5])
    調教行為実行判定(ctx, target, player, array)
}

train.内容取得 = (文脈, 対象, 実行者, 命令者) => {
    const 内容 = new TrainStatus(対象, 実行者, 命令者)
    const キスあり = false

    内容.命令者ソース.疲労 = 5
    内容.命令者ソース.消耗 = 5
    内容.命令者ソース.征服 = 10

    内容.実行者ソース.疲労 = 5
    内容.実行者ソース.消耗 = 20
    内容.実行者ソース.情愛 = 50
    内容.実行者ソース.親交 = 100

    内容.対象者ソース.疲労 = 5
    内容.対象者ソース.消耗 = 20
    内容.対象者ソース.情愛 = 50
    内容.対象者ソース.親交 = 100

    return 内容
}
