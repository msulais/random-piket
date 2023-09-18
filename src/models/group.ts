import { GroupJSON } from "../types"
import { Member } from "./member"
import { Place } from "./place"

export class Group {
    public members: Member[]
    public place: Place

    constructor(
        members: Member[],
        place: Place
    ){
        this.members = members
        this.place = place
    }

    public toJSON(): GroupJSON {
        return {
            members: this.members.map(v => v.toJSON()),
            place: this.place.toJSON()
        }
    }

    public get isFull(): boolean {
        return this.place.isLimited && this.members.length == this.place.maxMembers
    }

    static parse(group: GroupJSON): Group {
        return new Group(
            group.members.map(v => Member.parse(v)),
            Place.parse(group.place)
        )
    }
}