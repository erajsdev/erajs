/**
 * ＶエロＬＶ１
 */
import { TrainDef, Train, SourceTable, TrainStatus, 同性判定, getGaugeLevel, 調教行為実行判定 } from "../train";

const train = new TrainDef()
export default train

train.ID = 10
train.名前 = "指挿れ"
train.属性.add("エロ", "Ｖ", "愛撫", "前戯")

train.発動条件 = (ctx, target, player, commander) => {
    return target.特性.Ｖ有り
}

train.許容判定 = (ctx, target, player, commander, array) => {
    array.push([train.名前, -25])
    調教行為実行判定(ctx, target, player, array)
}

train.内容取得 = (文脈, 対象, 実行者, 命令者) => {
    const 内容 = new TrainStatus(対象, 実行者, 命令者)

    内容.命令者ソース.疲労 = 5
    内容.命令者ソース.消耗 = 5
    内容.命令者ソース.征服 = 30

    内容.実行者ソース.疲労 = 30
    内容.実行者ソース.消耗 = 20
    内容.実行者ソース.性行動 = 40
    内容.実行者ソース.達成 = 40
    内容.実行者ソース.奉仕 = 40
    内容.実行者ソース.不潔 = 40
    内容.実行者ソース.逸脱 = 30
    内容.実行者ソース.性的 = 40

    内容.対象者ソース.疲労 = 20
    内容.対象者ソース.消耗 = 30
    内容.対象者ソース.快Ｖ = 50
    内容.接触追加(対象, "Ｖ", 実行者, "手")
    内容.対象者ソース.露出 = 40
    内容.対象者ソース.逸脱 = 30
    内容.対象者ソース.受動 = 20
    内容.対象者ソース.性的 = 30

    return 内容
}
