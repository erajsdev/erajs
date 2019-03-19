import { savedata, saveclass, serializer } from './savedata'
console.log("variables")

/**
 * グローバル変数みたいなテーブル
 * 
 * 
 */
@saveclass("variable")
export class Variables {
    @savedata 日付 = new Date()
    @savedata 所持金 = 0
    @savedata 選択中のキャラID: string[] = []
}

@saveclass("date")
export class Date {
    @savedata 年 = 1
    @savedata 月 = 1
    @savedata 日 = 1
    @savedata 時 = 0
    @savedata 分 = 0
    @savedata 秒 = 0
    @savedata ミリ秒 = 0
}

