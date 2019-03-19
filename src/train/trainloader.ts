import { TrainDef } from "./train";
import { trainList } from "./trainlist";

let cache: TrainDef[] | undefined = undefined

export const getTrainList = async () => {
    if (cache)
        return cache
    const ret: TrainDef[] = []
    for (const k of trainList) {
        ret.push((await k).default)
    }
    cache = ret
    return ret
}


