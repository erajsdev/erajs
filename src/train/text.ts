
import { Train } from './train'

export class TextResolver {
    static resolve(ctx: Train, words: string[]): string {
        const buf: string[] = []
        let focused = ""
        const randomFocus = () => {
            const idx = Math.max(0, Math.min(5, Math.floor(Math.random() * 6)))
            return ['Ｃ', "Ｖ", "Ｂ", "Ｍ", "Ｐ", "Ａ"][idx]
        }
        const T = (str: string) => {
            buf.push(str)
        }
        for (let i = 0; i < words.length; i++) {
            const word = words[i]
            const isFirst = i == 0
            const isLast = i == (words.length - 1)
            switch (word) {
            case '、':
                buf.push('、')
                break;

            // 重視傾向
            case 'Ｐ':
                focused = 'Ｐ'
                break;
            case 'Ｖ':
                focused = 'Ｖ'
                break;
            case 'Ｂ':
                focused = 'Ｂ'
                break;
            case 'Ｃ':
                focused = 'Ｃ'
                break;
            case 'Ｍ':
                focused = 'Ｍ'
                break;
            case 'Ａ':
                focused = 'Ａ'
                break;

            // 実行系
            case '愛撫':
                if (focused == "")
                    randomFocus()
                if (Math.random() > 0.5)
                    T('撫でまわし')
                else if (Math.random() > 0.5)
                    T('愛撫し')
                if (isLast)
                    T('た。')
                else
                    T('ながら')
                if (Math.random() > 0.5)
                    focused = ""
                break;

            case 'キス':
                if (focused == "")
                    focused = "Ｍ"
                if (Math.random() > 0.5)
                    T('キスし')
                else if (Math.random() > 0.5)
                    T('口付け')
                if (isLast)
                    T('た。')
                else
                    T('ながら')
                if (Math.random() > 0.5)
                    focused = ""
                break;
            }
        }
        return buf.join("")
    }
}

type Resolver = (c: Train) => string
const resolvers: { [k: string]: Resolver } = {
    愛撫: c => {
        return ""
    }
}

export const trainmessages = {
    愛撫: (c: Train) => {
        return `${c.playersName()}は${c.targetsName()}を愛撫した。`
    }
}

