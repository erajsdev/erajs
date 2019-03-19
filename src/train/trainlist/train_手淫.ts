/**
 * 奉仕エロＬＶ１
 */
import { TrainDef, Train, SourceTable, TrainStatus, 同性判定, getGaugeLevel, 調教行為実行判定 } from "../train";
import { 指使い } from '../traintraitcalc'



const train = new TrainDef()
export default train

train.ID = 80
train.名前 = "手淫"
train.属性.add("エロ", "Ｐ", "愛撫", "前戯")

train.発動条件 = (ctx, target, player, commander) => {
    return target.特性.Ｐ有り
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

    内容.実行者ソース.疲労 = 10
    内容.実行者ソース.消耗 = 50
    内容.実行者ソース.情愛 = 50
    内容.実行者ソース.性行動 = 250
    内容.実行者ソース.達成 = 50
    内容.実行者ソース.屈従 = 350
    内容.実行者ソース.奉仕 = 50
    内容.実行者ソース.不潔 = 60
    内容.実行者ソース.逸脱 = 100
    内容.実行者ソース.性的 = 100

    内容.対象者ソース.疲労 = 10
    内容.対象者ソース.消耗 = 40
    内容.対象者ソース.快Ｐ = 80 * 指使い(実行者)
    内容.接触追加(対象, "Ｐ", 実行者, "手")
    内容.対象者ソース.露出 = 40
    内容.対象者ソース.逸脱 = 30
    内容.対象者ソース.受動 = 30
    内容.対象者ソース.性的 = 30

    return 内容
}
