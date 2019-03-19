/**
 * 親交行動ＬＶ２
 */
import { TrainDef, Train, SourceTable, TrainStatus, 同性判定, getGaugeLevel, 調教行為実行判定 } from "../train";

const train = new TrainDef()
export default train

train.ID = 102
train.名前 = "スキンシップ"
train.属性.add("日常")

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
    内容.命令者ソース.征服 = 30

    内容.実行者ソース.疲労 = 20
    内容.実行者ソース.消耗 = 25
    内容.実行者ソース.情愛 = 100
    内容.実行者ソース.性行動 = 50
    内容.実行者ソース.達成 = 100
    内容.実行者ソース.親交 = 100
    //うっかりさん
    if (実行者.特性.Ｐ有り && Math.random() > 0.75) {
        内容.実行者ソース.快Ｐ = 50
        内容.実行者ソース.性的 += 20
        内容.実行者ソース.露出 += 20
    }
    //うっかりさん2
    if (実行者.特性.Ｂ有り && Math.random() > 0.5) {
        内容.実行者ソース.快Ｂ = 50
        内容.実行者ソース.性的 += 20
        内容.実行者ソース.露出 += 20
    }

    内容.対象者ソース.疲労 = 25
    内容.対象者ソース.消耗 = 20
    内容.対象者ソース.情愛 = 150
    内容.対象者ソース.性行動 = 50
    内容.対象者ソース.達成 = 100
    内容.対象者ソース.親交 = 100
    //逆うっかりさん
    if (対象.特性.Ｐ有り && Math.random() > 0.75) {
        内容.対象者ソース.快Ｐ = 50
        内容.対象者ソース.性的 += 20
        内容.対象者ソース.露出 += 20
    }
    //逆うっかりさん2
    if (対象.特性.Ｂ有り && Math.random() > 0.5) {
        内容.対象者ソース.快Ｂ = 50
        内容.対象者ソース.性的 += 20
        内容.対象者ソース.露出 += 20
    }

    return 内容
}
