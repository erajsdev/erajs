import * as lz from 'lz-string'


export class SaveManager {
    classes = new Map<string, Function>()
    classNames = new Map<Function, string>()
    map = new Map<any, string[]>()

    registerClass(cls: any, name: string) {
        //console.log(`register class`, cls, name)
        this.classes.set(name, cls)
        this.classNames.set(cls, name)
    }
    registerMember(cls: any, key: string) {
        //console.log("register member", cls, key)
        const a = this.map.get(cls)
        if (a === undefined) {
            this.map.set(cls, [key])
        }
        else {
            a.push(key)
        }
    }

    saveStorage(slotKey: string, value: string) {
        window.localStorage.setItem(slotKey, value)
    }
    loadStorage(slotKey: string): string {
        return window.localStorage.getItem(slotKey) || ""
    }
    removeStorage(slotKey: string) {
        window.localStorage.removeItem(slotKey)
    }

    serialize(obj: any): string {
        const d = this.convertToSerializableData(obj)
        const str = JSON.stringify(d)
        const ret = lz.compressToBase64(str)
        return ret
    }
    deserialize(str: string): any {
        const json = lz.decompressFromBase64(str)
        const obj = JSON.parse(json)
        const d = this.makeFromSerializableData(obj)
        return d
    }
    clone<T>(obj: T): T {
        //console.log("clone", obj)
        const d = this.convertToSerializableData(obj)
        //console.log("clone inter", d)
        const ret = this.makeFromSerializableData(d)
        //console.log("cloned", ret)
        return ret
    }

    makeFromSerializableData(obj: any): any {
        if (obj === null)
            return null
        else if (obj === undefined)
            return undefined
        else if (typeof (obj) === "symbol")
            return undefined
        else if (typeof (obj) === "function")
            return undefined
        else if (typeof (obj) === "number")
            return obj
        else if (typeof (obj) === "boolean")
            return obj
        else if (typeof (obj) === "string")
            return obj
        else if (typeof (obj) === "object") {
            const clsName = obj.__class__
            if (clsName === "Map") {
                const ret = new Map()
                const members = obj.__data__
                for (const [k, v] of members) {
                    if (k !== undefined && v !== undefined)
                        ret.set(k, v)
                }
                return ret
            }
            else if (this.classes.has(clsName)) {
                const cls = this.classes.get(clsName)
                const data = obj.__data__
                //console.log(`load ${clsName}`, cls, data)
                if (cls && data) {
                    const o = new (<any>cls)()
                    for (const k in data) {
                        const val = this.makeFromSerializableData(data[k])
                        o[k] = val
                    }
                    return o
                }
                else {
                    return obj
                }
            }
            else {
                return obj
            }
        }
        else {
            return undefined
        }
    }

    convertToSerializableData(obj: any): any {
        if (obj === null)
            return null
        else if (obj === undefined)
            return undefined
        else if (typeof (obj) === "symbol")
            return undefined
        else if (typeof (obj) === "function")
            return undefined
        else if (typeof (obj) === "number")
            return obj
        else if (typeof (obj) === "boolean")
            return obj
        else if (typeof (obj) === "string")
            return obj
        else if (obj instanceof Array) {
            const ret = []
            for (let i = 0; i < obj.length; i++) {
                ret.push(this.convertToSerializableData(obj[i]))
            }
            return ret
        }
        else if (obj instanceof Map) {
            const ret = Object.create(null)
            ret.__class__ = "Map"
            const members = Array()
            ret.__data__ = members
            obj.forEach((v, k, m) => {
                members.push([k, v])
            })
            return ret
        }
        else if (typeof (obj) === "object") {
            const c = obj.constructor
            const name = this.classNames.get(c)
            const keys = this.map.get(c)
            //console.log("ctor", c, name, keys, obj)
            if (name && keys) {
                const data = Object.create(null)
                for (const k of keys) {
                    const val = obj[k]
                    const ser = this.convertToSerializableData(val)
                    //console.log("mem ", k, val, ser)
                    if (val !== undefined)
                        data[""+k] = val
                }
                const ret = Object.create(null)
                ret.__class__ = name
                ret.__data__ = data
                //console.log(ret)
                return ret
            }
            else {
                return undefined
            }
        }
        else {
            return undefined
        }
    }
}

/**
 * シリアライザのシングルトンインスタンス
 */
export const serializer = new SaveManager()


/**
 * メンバー変数に付けるデコレータ。
 * saveclassデコレータが付いたクラスのメンバーに付けるとシリアライザを通して自動的に保存されるようになる。
 */
export const savedata = (target: any, key: string) => {
    //console.log("@save")
    //console.log(target)
    //console.log(key)
    serializer.registerMember(target.constructor, key)
}


/**
 * クラスに付けるデコレータ。
 * 付けられたクラスはシリアライザを通して自動的に保存されるようになる。
 * savedataデコレータを付けられたメンバーが保存対象となる。
 */
/*
export const saveclass = (cls: any) => {
    //console.log("@saveObject")
    //console.log(cls)
    serializer.registerClass(cls, cls.name)
}
*/

export const saveclass = (name: string) => {
    return (cls: any) => {
        //console.log("@saveObject")
        //console.log(cls)
        serializer.registerClass(cls, name)
    }
}
