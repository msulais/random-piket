// import examples from './examples/members-places-data'
import type { SetStoreFunction } from 'solid-js/store'
import HomePage from './pages/home/index'
import HistoryPage from './pages/history/index'
import ResultPage from './pages/result/index'
import examples from './examples/members-places-data'
import { createStore } from 'solid-js/store'
import { Switch, Match, createContext, useContext, createEffect, onMount, createSignal, Show } from "solid-js"
import { SettingsManager } from 'tauri-settings'
import { HistoryJSON, MemberJSON, PlaceJSON, Settings, SettingsJSON, StoreData } from './types'
import { Routes, ThemeData } from './enums'
import { Member } from './models/member'
import { Place } from './models/place'
import { History } from './models/history'

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
        theme: ThemeData.system,
        defaultSaveFilePath: '',
        homePage: {
            memberCountPerPlace: { min: 1, max: 0 },
            members: { gridView: true },
            places: { gridView: true },
        },
        historyPage: {
            fromDate: null,
            toDate: null
        }
    }
    const defaultData: {members: Member[];places: Place[]} = {
        members: examples.members_and_unlimited_places.members,
        places: examples.members_and_unlimited_places.places,
    }
    const settingsJSONFile = new SettingsManager<SettingsJSON>(
        {
            ...defaultSettings,
            historyPage: {
                fromDate: '',
                toDate: ''
            }
        },
        { fileName: 'settings', prettify: true }
    )
    const dataJSONFile = new SettingsManager<{members: MemberJSON[]; places: PlaceJSON[]}>(
        {
            members: defaultData.members.map(v => v.toJSON()),
            places: defaultData.places.map(v => v.toJSON()),
        },
        { fileName: 'data', prettify: true }
    )
    const historyJSONFile = new SettingsManager<{history: HistoryJSON[]}>(
        {
            history: defaultHistory.history.map(v => v.toJSON())
        },
        { fileName: 'history', prettify: true }
    )
    const [store, setStore] = createStore<StoreData>({
        route: Routes.result,
        data: defaultData,
        history: [],
        settings: defaultSettings
    })
    const [isInitializing, setIsInitializing] = createSignal(true)

    onMount( async () => {
        try {
            const s = await settingsJSONFile.initialize()
            setStore('settings', {
                theme: s.theme,
                defaultSaveFilePath: s.defaultSaveFilePath,
                homePage: {
                    memberCountPerPlace: { min: s.homePage.memberCountPerPlace.min, max: s.homePage.memberCountPerPlace.max },
                    members: { gridView: s.homePage.members.gridView },
                    places: { gridView: s.homePage.places.gridView },
                },
                historyPage: {
                    fromDate: s.historyPage.fromDate == ''? null : new Date(s.historyPage.fromDate!),
                    toDate: s.historyPage.toDate == ''? null : new Date(s.historyPage.toDate!)
                }
            })
        } catch (e) { }
        try {
            const data = await dataJSONFile.initialize()
            setStore('data', {
                members: data.members.map(v => Member.parse(v)),
                places: data.places.map(v => Place.parse(v)),
            })
        } catch (e) { }
        try {
            const history = await historyJSONFile.initialize()
            setStore('history', history.history.map(v => History.parse(v)))
        } catch (e) {}
        setIsInitializing(false)
    })

    createEffect(() => {
        let root = document.querySelector(':root')
        root?.classList.toggle('system', store.settings.theme == ThemeData.system)
        root?.classList.toggle('dark', store.settings.theme == ThemeData.dark)
    })

    return (<Show when={ !isInitializing() }>
        <FilesContext.Provider value={{settings: settingsJSONFile, data: dataJSONFile, history: historyJSONFile}}>
            <StoreContext.Provider value={[store, setStore]}>
                <Switch>
                    <Match when={ store.route == Routes.home }>
                        <HomePage />
                    </Match>
                    <Match when={ store.route == Routes.result }>
                        <ResultPage />
                    </Match>
                    <Match when={ store.route == Routes.history }>
                        <HistoryPage />
                    </Match>
                </Switch>
            </StoreContext.Provider>
        </FilesContext.Provider>
    </Show>)
}
