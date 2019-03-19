import { io } from "../io"
import { CharacterReference } from "../character"
import { ExpTable } from "./exp"


export const viewAnyCharacterStatus = async () => {

}

export const viewStatus = async (c: CharacterReference) => {
    await io.drawLine()
    await io.printl(`名前: ${c.呼び名} (${c.名前})`)

    await viewGauge(c)
    await io.drawLine()
    await viewExp(c)
}


export const viewExp = async (c: CharacterReference) => {
    await io.printc(`キス経験: ${c.経験.キス}`)
    await io.printc(`絶頂経験: ${c.経験.絶頂}`)
    await io.printc(`精液経験: ${c.経験.精液}`)
    await io.printc(`噴乳経験: ${c.経験.噴乳}`)
    await io.printc(`精飲経験: ${c.経験.精飲}`)
    await io.printc(`膣射経験: ${c.経験.膣射}`)
    await io.printc(`射精経験: ${c.経験.射精}`)
}


export const viewGauge = async (c: CharacterReference) => {
    await io.prints(`　体力: ${c.変動.体力.value}/${c.変動.体力.max}`)
    await io.printBar(30, c.変動.体力.value, c.変動.体力.max)
    //await io.printBar(12, c.変動.体力.value, c.変動.体力.max)
    await io.newline()
    await io.prints(`　気力: ${c.変動.気力.value}/${c.変動.気力.max}`)
    await io.printBar(30, c.変動.気力.value, c.変動.気力.max)
    await io.newline()
    //await io.printl(`　勃起: ${c.変動.勃起.value}/${c.変動.勃起.max}`)
    //await io.printl(`　精力: ${c.変動.精力.value}/${c.変動.精力.max}`)
}

