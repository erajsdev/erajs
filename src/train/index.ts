
import "./trainloader"
import "./trainmode"
import { AsyncEvent } from "../util/event";
import { makeModuleInitializer } from "../util/moduleInitializer";

export const initializeModule = makeModuleInitializer(
    import('./levelupmode'),
    import('./train'),
    import('./trainmode'),
)


