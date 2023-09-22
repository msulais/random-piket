import examples from './examples/members-places-data'
import type { SetStoreFunction } from 'solid-js/store'
import HomePage from './pages/home/index'
import HistoryPage from './pages/history/index'
import ResultPage from './pages/result/index'
import { createStore } from 'solid-js/store'
import { Switch, Match, createContext, useContext, createEffect, onMount, createSignal, Show } from "solid-js"
import { SettingsManager } from 'tauri-settings'
import { HistoryJSON, MemberJSON, PlaceJSON, Settings, SettingsJSON, StoreData } from './types'
import { Routes, ThemeData } from './enums'
import { Member } from './models/member'
import { Place } from './models/place'
import { History } from './models/history'
import { closeAllMenu } from './components/Menu'

export const FilesContext = createContext<{
    settings: SettingsManager<SettingsJSON>;
    data: SettingsManager<{members: MemberJSON[]; places: PlaceJSON[]}>;
    history: SettingsManager<{history: HistoryJSON[]}>} | null>(null)

export const StoreContext = createContext<[StoreData, SetStoreFunction<StoreData>] | null>(null)

export const useStore = () => useContext(StoreContext)

export const useFiles = () => useContext(FilesContext)

export default () => {
    const defaultHistory: { history: History[] } = {history: []}
    const defaultSettings: Settings = {
        theme: ThemeData.SYSTEM,
        defaultSaveFilePath: '',
        homePage: {
            memberCountPerPlace: { min: 1, max: 0 },
        },
    }
    const defaultData: {members: Member[];places: Place[]} = {
        members: examples.members_and_unlimited_places.members,
        places: examples.members_and_unlimited_places.places,
    }
    const settingsJSONFile = new SettingsManager<SettingsJSON>(
        defaultSettings, { fileName: 'settings' }
    )
    const dataJSONFile = new SettingsManager<{members: MemberJSON[]; places: PlaceJSON[]}>(
        {
            members: defaultData.members.map(v => v.toJSON()),
            places: defaultData.places.map(v => v.toJSON()),
        }, { fileName: 'data' }
    )
    const historyJSONFile = new SettingsManager<{history: HistoryJSON[]}>(
        {
            history: defaultHistory.history.map(v => v.toJSON())
        }, { fileName: 'history' }
    )
    const [store, setStore] = createStore<StoreData>({
        route: Routes.HOME,
        data: defaultData,
        history: [],
        settings: defaultSettings
    })
    const [isInitializing, setIsInitializing] = createSignal(true)

    async function fetchingData(){
        try {
            const s = await settingsJSONFile.initialize()
            setStore('settings', {
                theme: s.theme ?? store.settings.theme,
                defaultSaveFilePath: s.defaultSaveFilePath ?? store.settings.defaultSaveFilePath,
                homePage: {
                    memberCountPerPlace: {
                        min: s.homePage.memberCountPerPlace.min ?? store.settings.homePage.memberCountPerPlace.min,
                        max: s.homePage.memberCountPerPlace.max ?? store.settings.homePage.memberCountPerPlace.max
                    },
                },
            })
        } catch (e) { }
        try {
            const data = await dataJSONFile.initialize()
            setStore('data', {
                members: data.members? data.members.map(v => Member.parse(v)) : [...store.data.members],
                places: data.places? data.places.map(v => Place.parse(v)) : [...store.data.places],
            })
        } catch (e) { }
        try {
            const history = await historyJSONFile.initialize()
            setStore('history', history.history ? history.history.map(v => History.parse(v)) : [])
        } catch (e) {}
        setIsInitializing(false)
    }

    function addOnOpenDialogEvent(){
        const dialogs = document.querySelectorAll('dialog');

        dialogs.forEach((dial) => (dial as any)['onopen'] = function(){} )

        const ObserverM = new MutationObserver( recs => {
            recs.forEach( ({attributeName: attr, target: dial }) => {
                if (attr === 'open' && (dial as HTMLDialogElement).open ) (dial as any).onopen();
            })
        });
        dialogs.forEach( dial => ObserverM.observe( dial, { attributes: true }))
    }

    onMount( async () => {
        const body = document.body
        await fetchingData()
        addOnOpenDialogEvent()

        // Close all menu when click outside menu
        window.onclick = () => closeAllMenu()

        // Prevent default context menu
        document.oncontextmenu = event => event.preventDefault()

        // Prevent document.body scroll when open dialog
        for (const dialog of document.querySelectorAll('dialog')){
            (dialog as any).onopen = () => body.style.overflow = 'hidden'
            dialog.onclose = () => body.style.overflow = 'auto'
        }
    })

    createEffect(() => {
        let root = document.querySelector(':root')
        root?.classList.toggle('system', store.settings.theme == ThemeData.SYSTEM)
        root?.classList.toggle('dark', store.settings.theme == ThemeData.DARK)
    })

    return (<Show when={ !isInitializing() }>
        <FilesContext.Provider value={{settings: settingsJSONFile, data: dataJSONFile, history: historyJSONFile}}>
            <StoreContext.Provider value={[store, setStore]}>
                <Switch>
                    <Match when={ store.route == Routes.HOME }>
                        <HomePage />
                    </Match>
                    <Match when={ store.route == Routes.RESULT }>
                        <ResultPage />
                    </Match>
                    <Match when={ store.route == Routes.HISTORY }>
                        <HistoryPage />
                    </Match>
                </Switch>
            </StoreContext.Provider>
        </FilesContext.Provider>
    </Show>)
}
