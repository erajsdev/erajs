/**
 * コンソール画面の真似を行う
 * 結局のところDOMなので拡張は結構自由がきく
 * とりあえず最初にEmueraの表示機能再現だけやった
 */
import { Event, AsyncEvent } from './util/event'

/**
 * 画面表示と入力
 */
class IO {
    private mainBox: HTMLElement | undefined
    private texts: HTMLElement | undefined
    private lastElement: HTMLElement | undefined
    private textInput: HTMLInputElement | undefined
    private currentLine: HTMLDivElement | undefined
    private currentAlign: 'left' | 'center' | 'right' = 'left'
    private initialized = false
    private currentPrintMode: "normal" | "cells" = "normal"

    readonly inputStringEvent = new Event<string>()
    readonly clickEvent = new Event<void>()
    readonly newerButtonStarters: (() => void)[] = []
    readonly olderButtonDisposers: (() => void)[] = []

    initialize() {
        if (this.initialized)
            return;
        this.initialized = true

        console.log("io init")
        this.mainBox = document.createElement('div')
        this.mainBox.classList.add("mainbox")
        document.body.appendChild(this.mainBox)

        this.texts = document.createElement('div')
        this.texts.classList.add("texts")
        this.mainBox.appendChild(this.texts)

        this.currentLine = document.createElement('div')
        this.currentLine.classList.add("line")
        this.texts.appendChild(this.currentLine)

        this.lastElement = document.createElement('div')
        this.lastElement.classList.add("lastelement")
        this.mainBox.appendChild(this.lastElement)

        this.textInput = document.createElement('input')
        this.textInput.classList.add("textinput")
        document.body.appendChild(this.textInput)

        window.addEventListener("mousedown", (ev) => {
            ev.stopPropagation()
            //ev.preventDefault()
            this.clickEvent.invoke()
        })
        // 右クリックスキップするには邪魔
        window.addEventListener("contextmenu", (ev) => {
            ev.stopPropagation()
            ev.preventDefault()
        })
        window.addEventListener("dblclick", (ev) => {
            if (window.getSelection)
                window.getSelection().removeAllRanges();
            ev.stopPropagation()
            ev.preventDefault()
        })
        /*
        window.addEventListener("click", (ev) => {
            ev.stopPropagation()
            this.clickEvent.invoke()
        })*/
        this.textInput.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter" && this.textInput) {
                ev.stopPropagation()
                this.inputStringEvent.invoke(this.textInput.value)
            }
        })
    }

    /**
     * DOMノードを表示位置に差し込む
     */
    private printDOMElement(e: Node) {
        if (!this.currentLine) throw new Error()
        this.currentLine.appendChild(e)
        //this.texts.appendChild(e)
    }

    /**
     * 改行されていない要素が最後だったら改行する
     */
    async ensureNewline() {
        if (!this.currentLine) throw new Error()
        if (this.currentLine.childElementCount !== 0)
            await this.newline()
    }
    /**
     * 改行する
     */
    newline() {
        return this.newlineRaw("line")
    }
    newlinec() {
        return this.newlineRaw("cells")
    }
    async newlineRaw(cls: string) {
        if (!this.texts) throw new Error()
        this.currentLine = document.createElement('div')
        this.currentLine.classList.add(cls)
        this.currentLine.classList.add("align-" + this.currentAlign)
        this.texts.appendChild(this.currentLine)
        while (this.texts.childElementCount > 1000) {
            const fc = this.texts.firstChild
            if (fc)
                this.texts.removeChild(fc)
            //await this.waitTime(0)
        }
        await this.waitTime(0)
        //this.addElement(document.createElement("br"))
    }

    waitTime(milliseconds: number): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scrollToBottom()
            window.setTimeout(() => {
                this.scrollToBottom()
                resolve()
            }, milliseconds)
        })
    }

    /**
     * 行の揃え位置を変える
     */
    align(kind: 'left' | 'center' | 'right') {
        this.currentAlign = kind
    }

    /**
     * ボタン解釈などせず表示する
     */
    async printNormalDOM(node: Node): Promise<void> {
        if (this.currentPrintMode !== "normal") {
            this.currentPrintMode = "normal"
            await this.newline()
        }
        this.printDOMElement(node)
    }
    async printNormalRaw(str: string, tag?: string, addedClasses?: string[]): Promise<void> {
        if (addedClasses) {
            const t = document.createTextNode(str)
            const span = document.createElement(tag ? tag : "span")
            span.appendChild(t)
            span.classList.add.apply(span.classList, addedClasses)
            await this.printNormalDOM(span)
        }
        else {
            await this.printNormalDOM(document.createTextNode(str))
        }
    }
    async printCellDOM(node: Node): Promise<void> {
        if (this.currentPrintMode !== "cells") {
            this.currentPrintMode = "cells"
            await this.newlinec()
        }
        await this.printDOMElement(node)
    }
    async printCellRaw(s: string, tag?: string, addedClasses?: string[]): Promise<void> {
        const node = await this.autoFormatString(s)
        node.classList.add("cell")
        await this.printCellDOM(node)
    }

    /**
     * ボタンを表示する
     */
    async printButton(str: string, onclickValue: string): Promise<void> {
        const node = await this.makeButton(str, onclickValue)
        await this.printNormalDOM(node)
    }

    /**
     * ボタン表示する。セルを使う
     */
    async printcButton(str: string, onclickValue: string): Promise<void> {
        const node = await this.makeButton(str, onclickValue)
        node.classList.add("cell")
        await this.printCellDOM(node)
    }

    /**
     * ボタンのDOMノードを作成する
     */
    async makeButton(str: string, onclickValue: string): Promise<HTMLSpanElement> {
        const txt = document.createTextNode(str)
        const span = document.createElement("span")

        const f = () => {
            this.inputStringEvent.invoke(onclickValue)
        }
        this.newerButtonStarters.push(() => {
            span.classList.add("button")
            span.addEventListener("click", f)
        })
        this.olderButtonDisposers.push(() => {
            span.classList.remove("button")
            span.removeEventListener("click", f)
        })

        span.appendChild(txt)
        return span
    }

    /**
     * 文字列を表示する。自動でボタン化などする
     */
    async prints(s: string): Promise<void> {
        const node = await this.autoFormatString(s)
        await this.printNormalDOM(node)
    }

    /**
     * ボタン化などをされたDOMノードを返す
     */
    async autoFormatString(s: string): Promise<HTMLSpanElement> {
        const span = document.createElement("span")
        const buttonRE = /[^\[]*\[(\d+)\][^\[]*/g
        let hit = false
        while (true) {
            const x = buttonRE.exec(s)
            if (!x) break
            hit = true
            span.appendChild(await this.makeButton(x[0], x[1]))
            //console.log(x)
        }
        if (!hit) {
            span.appendChild(document.createTextNode(s))
        }
        return span
    }

    /**
     * 文字列をテーブル風に表示する。自動でボタン化などする
     * 実際の見た目はcssに依存する
     */
    async printc(s: string): Promise<void> {
        const node = await this.autoFormatString(s)
        node.classList.add("cell")
        await this.printCellDOM(node)
    }
    /**
     * 文字列を表示して改行する
     */
    async printl(s?: string): Promise<void> {
        if (s !== undefined)
            await this.prints(s)
        await this.newline()
    }
    /**
     * エラー表示する
     */
    async printError(s?: string): Promise<void> {
        if (s !== undefined)
            await this.printNormalRaw(s, "pre", ["error"])
        await this.newline()
    }
    /**
     * 文字列を表示して改行して入力待ち状態にする
     */
    async printw(s?: string): Promise<void> {
        if (s !== undefined)
            await this.prints(s)
        await this.newline()
        await this.wait()
    }
    /**
     * 横線を表示する
     */
    async drawLine() {
        await this.ensureNewline()
        const hr = document.createElement("hr")
        await this.printNormalDOM(hr)
        await this.newline()
    }

    /**
     * ゲージ表示する
     */
    async printBar(width: number, value: number, max: number) {
        await this.printNormalDOM(this.makeBar(width, value, max))
    }

    /**
     * ゲージ表示のDOMノードを作成する
     */
    private makeBar(width: number, value: number, max: number) {
        const textMode = false
        const ret = document.createElement("span")
        const addSpan = (cls: string, content?: string) => {
            const span = document.createElement("span")
            span.classList.add(cls)
            if (content) {
                span.appendChild(document.createTextNode(content))
            }
            ret.appendChild(span)
            return span
        }
        ret.classList.add("bar")
        if (textMode) {
            const filledChar = "*"
            const unfilledChar = "."
            width = Math.ceil(width)
            let result = ""
            const charUnit = max / width
            for (let i = 0; i < width; i++) {
                //console.log(i, charUnit, value, max, width)
                if (i == 0) {
                    addSpan("startChar", "[")
                }
                else if (i == width-1) {
                    addSpan("endChar", "]")
                }
                else {
                    if (value < charUnit * i) {
                        addSpan("unfilledChar", ".")
                    }
                    else {
                        addSpan("filledChar", "*")
                    }
                }
            }
            ret.appendChild(document.createTextNode(result))
        }
        else {
            const ratio = Math.max(0, Math.min(1, value / max))
            const filled = addSpan("filled")
            const unfilled = addSpan("unfilled")
            filled.style.width = `${width * ratio * 0.5}em`
            unfilled.style.width = `${width * (1 - ratio) * 0.5}em`
        }
        return ret
    }

    /**
     * 数値を入力する
     */
    async inputNumber(): Promise<number> {
        await io.ensureNewline()
        while (true) {
            const s = await this.inputStringInternal("(数値入力待ち)")
            if (s === "" || isNaN(+s)) continue
            //await this.printl("" + s)
            return +s
        }
    }

    /**
     * 文字列を入力する
     */
    async inputString(): Promise<string> {
        await io.ensureNewline()
        const s = await this.inputStringInternal("(文字列入力待ち)")
        //await this.printl(s)
        return s
    }

    /**
     * 文字列入力する
     */
    private inputStringInternal(display: string): Promise<string> {
        return new Promise((resolve) => {
            for (const f of this.newerButtonStarters)
                f()
            this.newerButtonStarters.splice(0, this.newerButtonStarters.length)

            const disp = this.inputStringEvent.addListener((str) => {
                disp()
                if (this.textInput) {
                    this.textInput.placeholder = ""
                    this.textInput.value = ""
                }
                for (const f of this.olderButtonDisposers)
                    f()
                this.olderButtonDisposers.splice(0, this.olderButtonDisposers.length)

                resolve(str)
            })
            if (this.lastElement) {
                //this.lastElement.textContent = display
                this.lastElement.textContent = ""
            }
            this.scrollToBottom()
            if (this.textInput) {
                this.textInput.value = ""
                this.textInput.placeholder = display
            }
        })
    }

    /**
     * 入力待ち状態に入る
     */
    wait(): Promise<void> {
        return new Promise((resolve) => {
            this.ensureNewline()
            if (this.textInput) {
                this.textInput.value = ""
                this.textInput.placeholder = "(クリックで進む)"
            }
            this.scrollToBottom()
            const ok = () => {
                disp1()
                disp2()
                if (this.textInput)
                    this.textInput.value = ""
                if (this.lastElement)
                    this.lastElement.textContent = ""
                resolve()
            }
            const disp1 = this.clickEvent.addListener(() => { ok() })
            const disp2 = this.inputStringEvent.addListener(() => { ok() })
        })
    }

    /**
     * 一番下にスクロールする
     */
    private scrollToBottom() {
        if (this.lastElement) {
            this.lastElement.scrollIntoView()
        }
        window.setTimeout(() => {
            if (this.lastElement) {
                this.lastElement.scrollIntoView()
            }
            if (this.textInput)
                this.textInput.focus()
        }, 0)
    }

    /**
     * 選択肢を表示する
     */
    async branch<T>(o: [string, T][]): Promise<T> {
        await io.ensureNewline()
        while (true) {
            let i = 0
            for (const [name, proc] of o) {
                await io.printcButton(name, "" + i)
                //await io.newline()
                i++
            }
            const num = await io.inputNumber()
            if (num < 0 || num >= o.length) continue
            return o[num][1]
        }
    }
    branchBlank<T>(): [string, T][] {
        return []
    }
}

export const io = new IO()
export const initializeModule = new AsyncEvent()
initializeModule.addListener(async () => {
    io.initialize()
})


