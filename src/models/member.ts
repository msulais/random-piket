import { MemberJSON } from "../types"

export class Member {
    public id: number
    public name: string
    public lastPlacesIds: number[]
    public fixedPlaceId: number

    constructor(
        id: number,
        name: string,
        lastPlacesIds: number[] | null,
        fixedPlaceId: number | null
    ){
        while (lastPlacesIds != null && lastPlacesIds.length < 5){
            lastPlacesIds.push(-1)
        }
        this.name = name
        this.id = id
        this.lastPlacesIds = lastPlacesIds ?? new Array<number>(5).fill(-1)
        this.fixedPlaceId = fixedPlaceId ?? -1
    }

    public setNewPlace(placeId: number): Member {
        this.lastPlacesIds.pop()
        this.lastPlacesIds.splice(0, 0, placeId)

        return this
    }

    public toJSON(): MemberJSON {
        return {
            id: this.id,
            name: this.name,
            lastPlaceIds: this.lastPlacesIds,
            fixedPlaceId: this.fixedPlaceId
        }
    }

    static parse(member: MemberJSON): Member {
        return new Member(member.id, member.name, member.lastPlaceIds, member.fixedPlaceId)
    }
}