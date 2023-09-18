import { HistoryJSON } from "../types"
import { Group } from "./group"

export class History {
    public data: Group[]
    public date: Date

    constructor(data: Group[], date: Date){
        this.data = data
        this.date = date
    }

    public toJSON(): HistoryJSON {
        return {
            data: this.data.map(v => v.toJSON()),
            date: this.date.toISOString()
        }
    }

    static parse(history: HistoryJSON): History {
        return new History(
            history.data.map(v => Group.parse(v)),
            new Date(history.date)
        )
    }
}