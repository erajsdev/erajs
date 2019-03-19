import { AsyncEvent } from "./event";


export interface InitializableModule {
    initializeModule: AsyncEvent<void>
}

export const makeModuleInitializer = (...ms: Promise<InitializableModule>[]) => {
    const r = new AsyncEvent()
    r.addListener(async () => {
        for (const mp of ms) {
            const module = await mp
            await module.initializeModule.invoke()
        }
    })
    return r
}


