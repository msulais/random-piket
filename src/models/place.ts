import { PlaceJSON } from "../types"

export class Place {
    public id: number
    public name: string
    public minMembers: number
    public maxMembers: number

    constructor(
        id: number,
        name: string,
        minMembers: number,
        maxMembers: number | null
    ){
        this.id = id
        this.name = name
        this.minMembers = minMembers
        this.maxMembers = maxMembers ?? 0
    }

    public toJSON(): PlaceJSON {
        return {
            id: this.id,
            name: this.name,
            minMembers: this.minMembers,
            maxMembers: this.maxMembers
        }
    }

    public copy(): Place {
        return new Place(this.id, this.name, this.minMembers, this.maxMembers)
    }

    public get isUnlimited(): boolean {
        return this.maxMembers < this.minMembers
    }

    public get isLimited(): boolean {
        return this.maxMembers >= this.minMembers
    }

    public membersCountInString(): string {
        if (this.minMembers < this.maxMembers) return this.minMembers + '-' + this.maxMembers + ' anggota'
        if (this.minMembers > this.maxMembers) return 'Min ' + this.minMembers + ' anggota'
        return this.minMembers + ' anggota'
    }

    static parse(place: PlaceJSON): Place {
        return new Place(
            place.id,
            place.name,
            place.minMembers,
            place.maxMembers
        )
    }
}

