
export class Event<T=void> {
    private fs: ((p: T) => void)[] = []

    addListener(f: (p: T) => void): () => void {
        this.fs.push(f)
        let disposed = false
        return () => {
            if (disposed) return
            disposed = true
            let remIdx = -1
            for (let i = 0; i < this.fs.length; i++) {
                if (this.fs[i] === f) {
                    remIdx = i
                    break
                }
            }
            if (remIdx !== -1) {
                this.fs.splice(remIdx, 1)
            }
        }
    }

    invoke(p: T) {
        for (var f of this.fs) {
            f(p)
        }
    }
}


export class AsyncEvent<T=void> {
    private fs: ((p: T) => void)[] = []

    addListener(f: (p: T) => Promise<void>): () => void {
        this.fs.push(f)
        let disposed = false
        return () => {
            if (disposed) return
            disposed = true
            let remIdx = -1
            for (let i = 0; i < this.fs.length; i++) {
                if (this.fs[i] === f) {
                    remIdx = i
                    break
                }
            }
            if (remIdx !== -1) {
                this.fs.splice(remIdx, 1)
            }
        }
    }

    async invoke(p: T) {
        for (var f of this.fs.slice()) {
            await f(p)
        }
    }
}
