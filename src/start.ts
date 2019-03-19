import { Game } from './game'
import { serializer, SaveManager } from './savedata';
import { makeModuleInitializer } from './util/moduleInitializer';
import './io'
import './train'
import './charadef'
import './characterstatus'
import './mainscene'
import { GaugeTable } from './characterstatus/gauge';



declare global {
    interface Window {
        game: Game
        serializer: SaveManager
    }
}

const initializeModule = makeModuleInitializer(
    import('./io'),
    import('./train'),
    import('./mainscene'),
    import('./characterstatus'),
)

const runLoader = async () => {
    await initializeModule.invoke()
    //await OnModulesPrepare.invoke()
    window.serializer = serializer
    window.game = new Game()
    const global: any = window
    global.GaugeTable = GaugeTable
    await Game.run(window.game)
}

window.addEventListener("load", runLoader)
