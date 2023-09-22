import type { ThemeData, Routes } from "./enums"
import { History } from "./models/history"
import type { Member } from "./models/member"
import type { Place } from "./models/place"

export type StoreData = {
    route: Routes
    data: {
        members: Member[]
        places: Place[]
    }
    history: History[]
    settings: Settings
}

export type Settings = {
    theme: ThemeData
    defaultSaveFilePath: string
    homePage: {
        memberCountPerPlace: {
            min: number
            max: number
        },
    },
}

export type SettingsJSON = {
    theme: ThemeData
    defaultSaveFilePath: string
    homePage: {
        memberCountPerPlace: {
            min: number
            max: number
        },
    },
}

export type ElementEvent<T = Element> = MouseEvent & {
    currentTarget: T
    target: Element
}

export type MemberJSON = {
    id: number
    name: string
    lastPlaceIds: number[]
    fixedPlaceId: number
}

export type PlaceJSON = {
    id: number
    name: string
    minMembers: number
    maxMembers: number
}

export type GroupJSON = {
    members: MemberJSON[],
    place: PlaceJSON
}

export type HistoryJSON = {
    data: GroupJSON[],
    date: string
}