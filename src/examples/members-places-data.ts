import { Place } from "../models/place"
import { Member } from "../models/member"

// 20 members
const members: Member[] = [
    new Member( 0, 'Sunt Occaecat', null, null),
    new Member( 1, 'Quis Et', null, null),
    new Member( 2, 'Ullamco Enim', null, null),
    new Member( 3, 'Et Qui', null, null),
    new Member( 4, 'Anim Officia', null, null),
    new Member( 5, 'Veniam Aute', null, null),
    new Member( 6, 'Aliqua Sint', null, null),
    new Member( 7, 'Magna Ipsum', null, null),
    new Member( 8, 'Voluptate Commodo', null, null),
    new Member( 9, 'Adipisicing Commodo', null, null),
    new Member(10, 'Tempor Culpa', null, null),
    new Member(11, 'Minim Non', null, null),
    new Member(12, 'Exercitation Ullamco', null, null),
    new Member(13, 'Aute Id', null, null),
    new Member(14, 'Sit Laborum', null, null),
    new Member(15, 'Anim Qui', null, null),
    new Member(16, 'Reprehenderit Velit', null, null),
    new Member(17, 'Cupidatat Cupidatat', null, null),
    new Member(18, 'Sint Laborum', null, null),
    new Member(19, 'Dolor Eu', null, null)
].sort((a, b) => a.name.localeCompare(b.name))

export default {

    // [members] < [places: limited]
    members_less_than_limited_places: {
        members,
        places: [
            new Place(0, 'Excepteur Deserunt', 7, 9),
            new Place(1, 'Laboris Ad', 6, 6),
            new Place(2, 'Commodo Non', 8, 20),
            new Place(3, 'Duis Sit', 4, 10),
            new Place(4, 'Id Esse', 3, 5)
        ].sort((a, b) => a.name.localeCompare(b.name))
    },

    // [members] > [places: limited]
    members_more_than_limited_places: {
        members,
        places: [
            new Place(0, 'Excepteur Deserunt', 2, 2),
            new Place(1, 'Laboris Ad', 1, 4),
            new Place(2, 'Commodo Non', 3, 3),
            new Place(3, 'Duis Sit', 4, 5),
            new Place(4, 'Id Esse', 3, 3)
        ].sort((a, b) => a.name.localeCompare(b.name))
    },

    // [members] [< | > | =] [places: unlimited]
    members_and_unlimited_places: {
        members,
        places: [
            new Place(0, 'Excepteur Deserunt', 3, 1),
            new Place(1, 'Laboris Ad', 4, 6),
            new Place(2, 'Commodo Non', 2, 1),
            new Place(3, 'Duis Sit', 4, 6),
            new Place(4, 'Id Esse', 3, 1)
        ].sort((a, b) => a.name.localeCompare(b.name))
    },
}