/**
 * ＶエロＬＶ２
 */
import { TrainDef, Train, SourceTable, TrainStatus, 同性判定, getGaugeLevel, 調教行為実行判定 } from "../train";

const train = new TrainDef()
export default train

train.ID = 11
train.名前 = "正常位"
train.属性.add("エロ", "Ｖ", "性交", "妊娠")

train.発動条件 = (ctx, target, player, commander) => {
    if (!player.特性.Ｐ有り)
        return false
    if (!target.特性.Ｖ有り)
        return false
    return true
}

train.許容判定 = (ctx, target, player, commander, array) => {
    array.push([train.名前, -55])
    調教行為実行判定(ctx, target, player, array)
}

train.内容取得 = (文脈, 対象者, 実行者, 命令者) => {
    const 内容 = new TrainStatus(対象者, 実行者, 命令者)

    内容.命令者ソース.疲労 = 5
    内容.命令者ソース.消耗 = 5
    内容.命令者ソース.征服 = 200

    内容.実行者ソース.疲労 = 85
    内容.実行者ソース.消耗 = 50
    内容.実行者ソース.性行動 = 400
    内容.実行者ソース.征服 = 200
    内容.実行者ソース.達成 = 300
    内容.実行者ソース.奉仕 = 300
    内容.実行者ソース.不潔 = 100
    内容.実行者ソース.逸脱 = 100
    内容.実行者ソース.性的 = 300
    内容.実行者ソース.快Ｐ = 500

    内容.対象者ソース.疲労 = 70
    内容.対象者ソース.消耗 = 60
    内容.対象者ソース.快Ｖ = 500
    内容.接触追加(対象者, "Ｖ", 実行者, "Ｐ")
    内容.対象者ソース.露出 = 50
    内容.対象者ソース.逸脱 = 200
    内容.対象者ソース.情愛 = 500
    内容.対象者ソース.苦痛 = 500
    内容.対象者ソース.受動 = 20
    内容.対象者ソース.性的 = 300

    return 内容
}
