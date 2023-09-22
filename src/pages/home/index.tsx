import styles from './index.module.scss'
import topBarStyles from '../../styles/topbar.module.scss'
import dialogStyles from '../../styles/dialog.module.scss'
import { For, Show } from "solid-js/web"
import { useFiles, useStore } from "../../App"
import { createEffect, createMemo, createSignal } from "solid-js"
import { Member } from "../../models/member"
import { Place } from "../../models/place"
import { createStore } from "solid-js/store"
import { Routes, ThemeData } from "../../enums"
import { ElementEvent } from "../../types"
import Icon from '../../components/Icon'

export default () => {
    const files = useFiles()!
    const [store, setStore] = useStore()!
    const [isReverseMembers, setIsReverseMembers] = createSignal<boolean>(false)
    const [isReversePlaces, setIsReversePlaces] = createSignal<boolean>(false)
    const [isSearchMembers, setIsSearchMembers] = createSignal<boolean>(false)
    const [isSearchPlaces, setIsSearchPlaces] = createSignal<boolean>(false)
    const [searchMemberValue, setSearchMemberValue] = createSignal<string>('')
    const [searchPlaceValue, setSearchPlaceValue] = createSignal<string>('')
    const [searchMemberTimeout, setSearchMemberTimeout] = createSignal<number | null>(null)
    const [searchPlaceTimeout, setSearchPlaceTimeout] = createSignal<number | null>(null)
    const [message, setMessage] = createSignal<string>('')
    const [minMembers, setMinMembers] = createSignal<number>(0)
    const [maxMembers, setMaxMembers] = createSignal<number | string>(0)
    const [selectedPlaces, setSelectedPlaces] = createStore<number[]>([])
    const [selectedMembers, setSelectedMembers] = createStore<number[]>([])
    const [isEditing, setIsEditing] = createSignal<boolean>(false)
    const [index, setIndex] = createSignal<number>(0)
    const [isSingleDelete, setIsSingleDelete] = createSignal<boolean>(false)
    const sortedPlaces = createMemo<Place[]>(() => [...store.data.places].sort((a, b) => a.name.localeCompare(b.name)))
    const places = createMemo<Place[]>(() => {
        const places = [...store.data.places]
        if (isSearchPlaces() && searchPlaceValue().trim() != ''){
            return places
                .filter(v => v.name.toLowerCase().includes(searchPlaceValue().toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name) * (isReversePlaces()? -1 : 1))
        }
        return places.sort((a, b) => a.name.localeCompare(b.name) * (isReversePlaces()? -1 : 1))
    })
    const members = createMemo<Member[]>(() => {
        const members = [...store.data.members]
        if (isSearchMembers() && searchMemberValue().trim() != ''){
            return members
                .filter(v => v.name.toLowerCase().includes(searchMemberValue().toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name) * (isReverseMembers()? -1 : 1))
        }
        return members.sort((a, b) => a.name.localeCompare(b.name) * (isReverseMembers()? -1 : 1))
    })
    const placesCount = createMemo<number>(() => store.data.places.length)
    const membersCount = createMemo<number>(() => store.data.members.length)
    const selectedPlacesCount = createMemo<number>(() => selectedPlaces.length)
    const selectedMembersCount = createMemo<number>(() => selectedMembers.length)
    const placeRefs: {
        dialog: HTMLDialogElement | undefined
        nameInput: HTMLInputElement | undefined
        minInput: HTMLInputElement | undefined
        maxInput: HTMLInputElement | undefined
    } = {
        dialog: undefined,
        nameInput: undefined,
        minInput: undefined,
        maxInput: undefined,
    }
    const memberRefs: {
        dialog: HTMLDialogElement | undefined
        nameInput: HTMLInputElement | undefined
        fixedPlace: HTMLSelectElement | undefined
        lastPlaces: {
            a: HTMLSelectElement | undefined
            b: HTMLSelectElement | undefined
            c: HTMLSelectElement | undefined
            d: HTMLSelectElement | undefined
            e: HTMLSelectElement | undefined
        }
    } = {
        dialog: undefined,
        nameInput: undefined,
        fixedPlace: undefined,
        lastPlaces: {
            a: undefined,
            b: undefined,
            c: undefined,
            d: undefined,
            e: undefined
        }
    }
    let aboutDialogRef: HTMLDialogElement
    let membersInfoDialogRef: HTMLDialogElement
    let placesInfoDialogRef: HTMLDialogElement
    let confirmDeletePlacesDialogRef: HTMLDialogElement
    let confirmDeleteMembersDialogRef: HTMLDialogElement
    let settingsDialogRef: HTMLDialogElement

    function openDialog(ref: HTMLDialogElement, callback: () => void = () => {}){
        callback()
        ref.showModal()
    }

    function closeDialog(ref: HTMLDialogElement, callback: () => void = () => {}){
        callback()
        ref.close()
    }

    function goToResultPage(): void {
        setStore('route', Routes.RESULT)
    }

    function goToHistoryPage(): void {
        setStore('route', Routes.HISTORY)
    }

    function openPlaceDialog(index: number | null): void {
        setIsEditing(index != null)
        if (isEditing()) setIndex(index!)

        placeRefs.nameInput!.value = isEditing() ? places()[index!].name : ''
        placeRefs.minInput!.value = (isEditing() ? places()[index!].minMembers : store.settings.homePage.memberCountPerPlace.min) + ''
        placeRefs.maxInput!.value = (isEditing() ? places()[index!].maxMembers : store.settings.homePage.memberCountPerPlace.max) + ''

        openDialog(placeRefs.dialog!)
    }

    function openMemberDialog(index: number | null): void {
        setIsEditing(index != null)
        if (isEditing()) setIndex(index!)

        memberRefs.nameInput!.value = isEditing() ? members()[index!].name : ''
        if (memberRefs.fixedPlace) memberRefs.fixedPlace!.value = isEditing() ? `${members()[index!].fixedPlaceId}` : '-1'
        if (memberRefs.lastPlaces.a) memberRefs.lastPlaces.a!.value = isEditing() ? `${members()[index!].lastPlacesIds[0]}` : '-1'
        if (memberRefs.lastPlaces.b) memberRefs.lastPlaces.b!.value = isEditing() ? `${members()[index!].lastPlacesIds[1]}` : '-1'
        if (memberRefs.lastPlaces.c) memberRefs.lastPlaces.c!.value = isEditing() ? `${members()[index!].lastPlacesIds[2]}` : '-1'
        if (memberRefs.lastPlaces.d) memberRefs.lastPlaces.d!.value = isEditing() ? `${members()[index!].lastPlacesIds[3]}` : '-1'
        if (memberRefs.lastPlaces.e) memberRefs.lastPlaces.e!.value = isEditing() ? `${members()[index!].lastPlacesIds[4]}` : '-1'

        openDialog(memberRefs.dialog!)
    }

    async function savePlaceDialog(): Promise<void> {
        if (placeRefs.nameInput!.value.trim() == '') {
            setMessage('Nama tempat tidak boleh kosong')
            return
        }

        if (!/^-?[0-9]+$/.test(placeRefs.minInput!.value)) {
            setMessage('Nilai <code>min</code> harus berupa angka')
            return
        }

        if (!/^-?[0-9]+$/.test(placeRefs.maxInput!.value)) {
            setMessage('Nilai <code>max</code> harus berupa angka')
            return
        }

        if (Number.parseInt(placeRefs.minInput!.value) < 1) {
            setMessage('Nilai <code>min</code> harus lebih dari 0 (minimal 1)')
            return
        }

        if (Number.parseInt(placeRefs.maxInput!.value) < 0) {
            setMessage('Nilai <code>max</code> harus lebih dari -1 (minimal 0)')
            return
        }

        if (isEditing()) {
            const newPlaces = [...places()];
            newPlaces[index()] = new Place(
                newPlaces[index()].id,
                placeRefs.nameInput!.value,
                Number.parseInt(placeRefs.minInput!.value),
                Number.parseInt(placeRefs.maxInput!.value)
            )
            const ids = newPlaces.map(p => p.id)
            setStore('data', 'places', p => [
                ...p.filter(v => !ids.includes(v.id)),
                ...newPlaces
            ])
        } else {
            let id: number = 0
            for (const place of store.data.places) {
                if (place.id >= id) id = place.id + 1
            }

            setStore('data', 'places', places => [
                ...places,
                new Place(
                    id,
                    placeRefs.nameInput!.value,
                    Number.parseInt(placeRefs.minInput!.value),
                    Number.parseInt(placeRefs.maxInput!.value)
                )
            ])

            setStore('settings', 'homePage', 'memberCountPerPlace', 'min', Number.parseInt(placeRefs.minInput!.value))
            setStore('settings', 'homePage', 'memberCountPerPlace', 'max', Number.parseInt(placeRefs.maxInput!.value))
        }

        files.settings.setCache('homePage.memberCountPerPlace.min', Number.parseInt(placeRefs.minInput!.value))
        files.data.setCache('places', [...store.data.places].map(v => v.toJSON()))
        files.settings.syncCache()
        files.data.syncCache()
        closePlaceDialog()
    }

    async function saveMemberDialog(): Promise<void> {
        if (memberRefs.nameInput!.value.trim() == '') {
            setMessage('Nama anggota tidak boleh kosong')
            return
        }

        if (isEditing()) {
            const newMembers = [...members()]
            newMembers[index()] = new Member(
                newMembers[index()].id,
                memberRefs.nameInput!.value,
                [
                    Number.parseInt(memberRefs.lastPlaces.a!.value),
                    Number.parseInt(memberRefs.lastPlaces.b!.value),
                    Number.parseInt(memberRefs.lastPlaces.c!.value),
                    Number.parseInt(memberRefs.lastPlaces.d!.value),
                    Number.parseInt(memberRefs.lastPlaces.e!.value),
                ],
                Number.parseInt(memberRefs.fixedPlace!.value)
            )
            const ids = newMembers.map(v => v.id)
            setStore('data', 'members', m => [
                ...m.filter(v => !ids.includes(v.id)),
                ...newMembers
            ])
        } else {
            const memberNames = memberRefs
                .nameInput!
                .value
                .trim()
                .split(',')
                .map(m => m.trim())
                .filter(m => m != '')

            if (memberNames.length == 0) {
                setMessage('Nama anggota tidak boleh kosong')
                return
            }

            let id: number = 0
            for (const member of store.data.members) {
                if (member.id >= id) id = member.id + 1
            }

            setStore('data', 'members', _members => [
                ..._members,
                ...memberNames.map(name => {
                    const member = new Member(id, name, null, null)
                    ++id
                    return member
                })
            ])
        }

        files.data.setCache('members', [...store.data.members].map(v => v.toJSON()))
        files.data.syncCache()
        closeMemberDialog()
    }

    function closePlaceDialog(): void {
        setIsEditing(false)
        setMessage('')
        placeRefs.dialog?.close()
    }

    function closeMemberDialog(): void {
        setIsEditing(false)
        setMessage('')
        memberRefs.dialog?.close()
    }

    function deletePlaces(id: number = -1): void {
        setIsSingleDelete(id >= 0)
        if (id >= 0) selectOrUnselectPlace(null, id)
        confirmDeletePlacesDialogRef?.showModal()
    }

    async function confirmAlertDeletePlaces(): Promise<void> {
        setStore(
            'data',
            'places',
            places => [...places.filter(p => !selectedPlaces.includes(p.id))]
        );

        files.data.setCache('places', [...store.data.places].map(v => v.toJSON()))
        files.data.syncCache()
        unselectAllPlaces()
        closeAlertDeletePlaces()
    }

    function closeAlertDeletePlaces(): void {
        if (isSingleDelete()) unselectAllPlaces()
        confirmDeletePlacesDialogRef?.close()
    }

    function deleteMembers(id: number = -1): void {
        setIsSingleDelete(id >= 0)
        if (id >= 0) selectOrUnselectMember(null, id)
        confirmDeleteMembersDialogRef?.showModal()
    }

    async function confirmAlertDeleteMembers(): Promise<void> {
        setStore(
            'data',
            'members',
            members => [...members.filter(m => !selectedMembers.includes(m.id))]
        );

        files.data.setCache('members', [...store.data.members].map(v => v.toJSON()))
        files.data.syncCache()
        unselectAllMembers()
        closeAlertDeleteMembers()
    }

    function closeAlertDeleteMembers(): void {
        if (isSingleDelete()) unselectAllMembers()
        confirmDeleteMembersDialogRef?.close()
    }

    function selectAllPlaces(): void {
        setSelectedPlaces([...places().map(p => p.id)]);
    }

    function selectAllMembers(): void {
        setSelectedMembers([...members().map(m => m.id)]);
    }

    function unselectAllPlaces(): void {
        setSelectedPlaces([]);
    }

    function unselectAllMembers(): void {
        setSelectedMembers([]);
    }

    function selectOrUnselectPlace(event: ElementEvent<HTMLButtonElement> | null, id: number): void {
        setSelectedPlaces(selectedPlaces.includes(id)
            ? [...selectedPlaces.filter(_id => _id != id)]
            : [...selectedPlaces, id]
        )

        if (event == null) return;
        event.stopPropagation();
    }

    function selectOrUnselectMember(event: ElementEvent<HTMLButtonElement> | null, id: number): void {
        setSelectedMembers(selectedMembers.includes(id)
            ? [...selectedMembers.filter(_id => _id != id)]
            : [...selectedMembers, id]
        )

        if (event == null) return;
        event.stopPropagation();
    }

    function openMemberSearch(){
        setIsSearchMembers(true)
        setSearchMemberValue('')
    }

    function openPlaceSearch(){
        setIsSearchPlaces(true)
        setSearchPlaceValue('')
    }

    async function changeTheme(theme: ThemeData){
        setStore('settings', 'theme', theme)
        files.settings.setCache('theme', theme)
        files.settings.syncCache()
    }

    createEffect(() => {
        let isLimitedQuota: boolean = true
        let minPlaceQuota: number = 0
        let maxPlaceQuota: number = 0

        for (const place of places()) {
            minPlaceQuota += place.minMembers
            maxPlaceQuota += Math.max(place.minMembers, place.maxMembers)

            if (isLimitedQuota)
                isLimitedQuota = place.isLimited
        }

        setMaxMembers(isLimitedQuota ? maxPlaceQuota : 'Unlimited')
        setMinMembers(minPlaceQuota)
    })

    const TopBarEl = () => {
        return (<header>
            <div class={topBarStyles.topBarLeading}>
                <button onClick={() => openDialog(settingsDialogRef)}>
                    <div><Icon>settings</Icon> Settings</div>
                </button>
                <button onClick={goToHistoryPage}>
                    <div><Icon>history</Icon> Histori</div>
                </button>
                <button onClick={() => openDialog(aboutDialogRef)}>
                    <div><Icon>info</Icon> Tentang aplikasi</div>
                </button>
            </div>
            <button class={topBarStyles.topBarTrailing} onClick={goToResultPage}>
                <div><Icon>autorenew</Icon> Buat</div>
            </button>
        </header>)
    }

    const BodyEl = () => {

        const PlacesEl = () => {

            const TopBar = () => (<div class={styles.sectionTopBar} data-search={isSearchPlaces()? '' : undefined}>
                <h2>Tempat</h2>
                <div>
                    <Show when={selectedPlacesCount() != 0}>
                        <p>{selectedPlacesCount()}/{placesCount()}</p>
                    </Show>
                    <Show
                        when={selectedPlacesCount() == 0}
                        fallback={<>
                            <Show when={places().length > selectedPlaces.length}>
                                <button title="Pilih semua" onClick={_ev => selectAllPlaces()}>
                                    <Icon>check_box</Icon>
                                </button>
                            </Show>
                            <button title="Hapus" onClick={_ev => deletePlaces()}>
                                <Icon>delete</Icon>
                            </button>
                            <Show when={!isSearchPlaces()}>
                                <button title='Cari anggota' onClick={openPlaceSearch}>
                                    <Icon>search</Icon>
                                </button>
                            </Show>
                            <button title="Batal edit" onClick={_ev => unselectAllPlaces()}>
                                <Icon>close</Icon>
                            </button>
                        </>}
                    >
                        <Show
                            when={placesCount() != 0}
                            fallback={<button title="Tambah" onClick={() => openPlaceDialog(null)}>
                                <Icon>add</Icon>
                            </button>}
                        >
                            <button title='Info' onClick={() => openDialog(placesInfoDialogRef)}>
                                <Icon>info</Icon>
                            </button>
                            <button title='Urutan' data-reverse={isReversePlaces()? '' : undefined} onClick={() => setIsReversePlaces(prev => !prev)}>
                                <Icon>arrow_downward</Icon>
                            </button>
                            <Show when={!isSearchPlaces()}>
                                <button title='Cari anggota' onClick={openPlaceSearch}>
                                    <Icon>search</Icon>
                                </button>
                            </Show>
                            <button title="Tambah" onClick={() => openPlaceDialog(null)}>
                                <Icon>add</Icon>
                            </button>
                        </Show>
                    </Show>
                </div>
            </div>)

            const Body = () => (<Show
                when={placesCount() != 0 || isSearchPlaces()}
                fallback={<div class={styles.sectionBodyEmpty}>
                    <Icon>wrong_location</Icon>
                    <h2>Belum ada tempat piket</h2>
                </div>}
            >
                <div class={styles.sectionBodyItems}>
                    <div data-edit={selectedPlacesCount() != 0 ? '' : undefined}>
                        <Show when={isSearchPlaces()}>
                            <div class={styles.sectionBodySearchItem}>
                                <Icon>search</Icon>
                                <input type="text" placeholder='Cari tempat' onInput={ev => {
                                    if (searchPlaceTimeout()) clearTimeout(searchPlaceTimeout()!)
                                    const value = ev.currentTarget.value
                                    const id = setTimeout(() => {
                                        setSearchPlaceValue(value)
                                        setSearchPlaceTimeout(null)
                                    }, 1E3)

                                    setSearchPlaceTimeout(id)
                                }}/>
                                <button onClick={() => setIsSearchPlaces(false)}><Icon>close</Icon></button>
                            </div>
                        </Show>
                        <For each={places()}>{(place, i) =>
                            <div
                                data-selected={selectedPlaces.includes(place.id) ? '' : undefined}
                                class={styles.sectionBodyItem}
                            >
                                <h3>{place.name}</h3>
                                <p>{place.membersCountInString()}</p>
                                <div>
                                    <button onClick={_ev => selectOrUnselectPlace(_ev, place.id)}><Icon><Show when={selectedPlaces.includes(place.id)} fallback={<>check_box_outline_blank</>}>check_box</Show> </Icon></button>
                                    <Show when={selectedPlacesCount() == 0}>
                                        <button onClick={_ => openPlaceDialog(i())}><Icon>edit</Icon></button>
                                        <button onClick={() => deletePlaces(place.id)}><Icon>delete</Icon></button>
                                    </Show>
                                </div>
                            </div>
                        }</For>
                    </div>
                </div>
            </Show>)

            return (<section class={styles.section}>
                <TopBar />
                <Body />
            </section>)
        }

        const MembersEl = () => {

            const TopBar = () => (<div class={styles.sectionTopBar}>
                <h2>Anggota</h2>
                <div>
                    <Show when={selectedMembersCount() != 0}>
                        <p>{selectedMembersCount()}/{membersCount()}</p>
                    </Show>
                    <Show
                        when={selectedMembersCount() == 0}
                        fallback={<>
                            <Show when={members().length > selectedMembers.length}>
                                <button title="Pilih semua" onClick={_ev => selectAllMembers()}>
                                    <Icon>check_box</Icon>
                                </button>
                            </Show>
                            <button title="Hapus" onClick={_ev => deleteMembers()}>
                                <Icon>delete</Icon>
                            </button>
                            <Show when={!isSearchMembers()}>
                                <button title='Cari anggota' onClick={openMemberSearch}>
                                    <Icon>search</Icon>
                                </button>
                            </Show>
                            <button title="Batal edit" onClick={_ev => unselectAllMembers()}>
                                <Icon>clear</Icon>
                            </button>
                        </>}
                    >
                        <Show
                            when={membersCount() != 0}
                            fallback={<button title="Tambah" onClick={() => openMemberDialog(null)}>
                                <Icon>add</Icon>
                            </button>}
                        >
                            <button title='Info' onClick={() => openDialog(membersInfoDialogRef!)}>
                                <Icon>info</Icon>
                            </button>
                            <button title='Urutan' data-reverse={isReverseMembers()? '' : undefined} onClick={() => setIsReverseMembers(prev => !prev)}>
                                <Icon>arrow_downward</Icon>
                            </button>
                            <Show when={!isSearchMembers()}>
                                <button title='Cari anggota' onClick={openMemberSearch}>
                                    <Icon>search</Icon>
                                </button>
                            </Show>
                            <button title="Tambah" onClick={() => openMemberDialog(null)}>
                                <Icon>add</Icon>
                            </button>
                        </Show>
                    </Show>
                </div>
            </div>)

            const Body = () => (<Show
                when={membersCount() != 0 || isSearchMembers()}
                fallback={<div class={styles.sectionBodyEmpty}>
                    <Icon>person_cancel</Icon>
                    <h2>Belum ada anggota piket</h2>
                </div>}
            >
                <div class={styles.sectionBodyItems}>
                    <div data-edit={selectedMembersCount() != 0 ? '' : undefined}>
                        <Show when={isSearchMembers()}>
                            <div class={styles.sectionBodySearchItem}>
                                <Icon>search</Icon>
                                <input type="text" placeholder='Cari anggota' onInput={ev => {
                                    if (searchMemberTimeout()) clearTimeout(searchMemberTimeout()!)
                                    const value = ev.currentTarget.value
                                    const id = setTimeout(() => {
                                        setSearchMemberValue(value)
                                        setSearchMemberTimeout(null)
                                    }, 1E3)

                                    setSearchMemberTimeout(id)
                                }}/>
                                <button onClick={() => setIsSearchMembers(false)}><Icon>close</Icon></button>
                            </div>
                        </Show>
                        <For each={members()}>{(member, i) =>
                            <div
                                data-selected={selectedMembers.includes(member.id) ? '' : undefined}
                                class={styles.sectionBodyItem}
                            >
                                <h3>{member.name}</h3>
                                <div>
                                    <button onClick={ev => selectOrUnselectMember(ev, member.id)}><Icon><Show when={selectedMembers.includes(member.id)} fallback={<>check_box_outline_blank</>}>check_box</Show> </Icon></button>
                                    <Show when={selectedMembersCount() == 0}>
                                        <button onClick={_ev => openMemberDialog(i())}><Icon>edit</Icon></button>
                                        <button onClick={() => deleteMembers(member.id)}><Icon>delete</Icon></button>
                                    </Show>
                                </div>
                            </div>
                        }</For>
                    </div>
                </div>
            </Show>)

            return (<section class={styles.section}>
                <TopBar />
                <Body />
            </section>)
        }

        return (<main class={styles.main}>
            <PlacesEl />
            <MembersEl />
        </main>)
    }

    const DialogEl = () => {

        const PlaceDialogEl = () => {
            return (<dialog ref={placeRefs.dialog} class={dialogStyles.dialog}>
                <div>
                    <h2><Show when={isEditing()} fallback={<>Tempat baru</>}>Edit tempat</Show></h2>
                    <div class={styles.placeDialog}>
                        <input
                            placeholder="Nama tempat..."
                            type="text"
                            name="name"
                            ref={placeRefs.nameInput}
                        />
                        <p>Jumlah anggota:</p>
                        <div>
                            <label>Min: <input
                                type="text"
                                pattern="[0-9]+"
                                name="min"
                                ref={placeRefs.minInput} />
                            </label>
                            <label>Max: <input
                                type="text"
                                pattern="[0-9]+"
                                name="max"
                                ref={placeRefs.maxInput}
                            /></label>
                        </div>
                        <div class={styles.placeDialogInfo}>
                            <Icon>info</Icon>
                            <p>Jika <code>min</code> lebih besar dari<code>max</code>, maka <code>max</code> dianggap unlimited (tanpa batas).</p>
                        </div>
                        <Show when={message().trim() != ''}>
                            <p class={ styles.errorMessage } innerHTML={message()}></p>
                        </Show>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closePlaceDialog}><div>Batal</div></button>
                        <button onClick={savePlaceDialog}>
                            <div><Show when={isEditing()} fallback={<>Buat</>}>Simpan</Show></div>
                        </button>
                    </div>

                </div>
            </dialog>)
        }

        const MemberDialogEl = () => {
            return (<dialog ref={memberRefs.dialog} class={dialogStyles.dialog}>
                <div>
                    <h2><Show when={isEditing()} fallback={<>Anggota baru</>}>Edit anggota</Show></h2>
                    <div class={styles.memberDialog}>
                        <input
                            placeholder="Nama anggota..."
                            type="text"
                            name="name"
                            ref={memberRefs.nameInput}
                        />
                        <Show when={!isEditing()} fallback={<>
                            <div class={styles.memberDialogFixedPlace}>
                                <select name="fixed_place" ref={memberRefs.fixedPlace}>
                                    <option value="-1">Tidak ada</option>
                                    <For each={sortedPlaces()}>{p =>
                                        <option value={p.id}>{p.name}</option>
                                    }</For>
                                </select>
                            </div>
                            <div class={styles.memberDialogLastPlaces}>
                                <p>Terakhir kali ditempatkan:</p>
                                <div>
                                    <select name="a" ref={memberRefs.lastPlaces.a}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={sortedPlaces()}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                    <select name="b" ref={memberRefs.lastPlaces.b}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={sortedPlaces()}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                    <select name="c" ref={memberRefs.lastPlaces.c}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={sortedPlaces()}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                    <select name="d" ref={memberRefs.lastPlaces.d}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={sortedPlaces()}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                    <select name="e" ref={memberRefs.lastPlaces.e}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={sortedPlaces()}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                </div>
                            </div>
                        </>}>
                            <div class={styles.memberDialogInfo}>
                                <Icon>info</Icon>
                                <p>Boleh juga memasukkan banyak nama anggota sekaligus (dipisah dengan koma <code>,</code>).</p>
                            </div>
                        </Show>
                        <Show when={message().trim() != ''}>
                            <p class={styles.errorMessage} innerHTML={message()}></p>
                        </Show>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeMemberDialog}><div>Batal</div></button>
                        <button onClick={saveMemberDialog}>
                            <div><Show when={isEditing()} fallback={<>Buat</>}>Simpan</Show></div>
                        </button>
                    </div>
                </div>
            </dialog>)
        }

        const AboutDialogEl = () => {
            return (<dialog ref={aboutDialogRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Tentang Aplikasi</h2>
                    <div class={styles.aboutDialog}>
                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"> <defs> <linearGradient gradientUnits="objectBoundingBox" x1="0.20621875" y1="0.49999985" x2="0.68325317" y2="0.49999985" id="gradient_1"> <stop offset="0%" stop-color="#7B6700" /> <stop offset="100%" stop-color="#FFD600" /> </linearGradient> <linearGradient gradientUnits="objectBoundingBox" x1="0.59498703" y1="0.50450987" x2="2.9156922E-07" y2="0.4999998" id="gradient_2"> <stop offset="0%" stop-color="#1EB25B" /> <stop offset="100%" stop-color="#00973F" /> </linearGradient> <path d="M1024 0L1024 0L1024 1024L0 1024L0 0L1024 0Z" id="path_1" /> <clipPath id="clip_1"> <use href="#path_1" clip-rule="evenodd" fill-rule="evenodd" /> </clipPath> </defs> <g id="icon" clip-path="url(#clip_1)"> <path d="M1024 0L1024 0L1024 1024L0 1024L0 0L1024 0Z" id="icon" fill="none" stroke="none" /> <path d="M954 461L954 461L954 760C954 799.77 921.77 832 882 832L630.673 832C590.903 832 558.673 799.77 558.673 760L558.673 533C558.673 493.23 590.903 461 630.673 461L954 461Z" id="Rectangle-2-Copy-2" fill="url(#gradient_1)" stroke="none" /> <path d="M720.309 461L720.309 461L720.309 856C720.309 895.77 688.079 928 648.309 928L368.663 928C328.893 928 296.663 895.77 296.663 856L296.663 533C296.663 493.23 328.893 461 368.663 461L720.309 461Z" id="Rectangle-2" fill="url(#gradient_2)" stroke="none" /> <path d="M426 461L426 461L426 952C426 991.77 393.77 1024 354 1024L141 1024C101.23 1024 69 991.77 69 952L69 461L426 461Z" id="Rectangle-2-Copy" fill="#00E676" stroke="none" /> <path d="M550 0C589.77 0 622 32.2301 622 72L622 389C622 428.77 589.77 461 550 461L474 461C434.23 461 402 428.77 402 389L402 72C402 32.2301 434.23 0 474 0L550 0Z" id="Rectangle-3" fill="#2C7DFF" stroke="none" /> <path d="M882 301C921.77 301 954 333.23 954 373L954 512L69 512L69 373C69 333.23 101.23 301 141 301L882 301Z" id="Rectangle-3-Copy-2" fill="#448CFF" stroke="none" /> </g> </svg>
                        <div>
                            <h3>Random Piket</h3>
                            <p>Versi: 0.1.2</p>
                            <p>Dibuat oleh <a target="_blank" rel="noopener noreferrer" href="https://msulais.github.io">Muhammad Sulais</a></p>
                        </div>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={() => closeDialog(aboutDialogRef)}><div>Tutup</div></button>
                    </div>
                </div>
            </dialog>)
        }

        const PlacesInfoDialogEl = () => {
            return (<dialog ref={placesInfoDialogRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Info tempat</h2>
                    <div class={styles.infoDialog}>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Banyak tempat</td>
                                    <td>: {store.data.places.length}</td>
                                </tr>
                                <tr>
                                    <td>Minimal anggota</td>
                                    <td>: {minMembers()}</td>
                                </tr>
                                <tr>
                                    <td>Maksimal anggota</td>
                                    <td>: {maxMembers()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={() => closeDialog(placesInfoDialogRef)}><div>Tutup</div></button>
                    </div>
                </div>
            </dialog>)
        }

        const MembersInfoDialogEl = () => {
            return (<dialog ref={membersInfoDialogRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Info anggota</h2>
                    <div class={styles.infoDialog}>
                        <p>Banyak anggota: {store.data.members.length}</p>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={() => closeDialog(membersInfoDialogRef)}><div>Tutup</div></button>
                    </div>
                </div>
            </dialog>)
        }

        const ConfirmDeletePlacesDialogEl = () => {
            return (<dialog ref={confirmDeletePlacesDialogRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Hapus tempat</h2>
                    <div class={styles.messageDialog}>
                        <p>Anda yakin ingin menghapus tempat yang dipilih?</p>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeAlertDeletePlaces}><div>Batal</div></button>
                        <button onClick={confirmAlertDeletePlaces}><div>Hapus</div></button>
                    </div>
                </div>
            </dialog>)
        }

        const ConfirmDeleteMembersDialogEl = () => {
            return (<dialog ref={confirmDeleteMembersDialogRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Hapus anggota</h2>
                    <div class={styles.messageDialog}>
                        <p>Anda yakin ingin menghapus anggota yang dipilih?</p>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeAlertDeleteMembers}><div>Batal</div></button>
                        <button onClick={confirmAlertDeleteMembers}><div>Hapus</div></button>
                    </div>
                </div>
            </dialog>)
        }

        const SettingsDialogEl = () => {
            return (<dialog ref={settingsDialogRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Pengaturan</h2>
                    <div class={styles.settingsDialog}>
                        <details open>
                            <summary><div>Tema <Icon>expand_more</Icon></div></summary>
                            <div class={styles.settingsDialogTheme}>
                                <button onClick={() => changeTheme(ThemeData.SYSTEM)}>
                                    <div><Icon><Show when={store.settings.theme == ThemeData.SYSTEM} fallback={<>radio_button_unchecked</>}>radio_button_checked</Show></Icon> System</div>
                                </button>
                                <button onClick={() => changeTheme(ThemeData.LIGHT)}>
                                    <div><Icon><Show when={store.settings.theme == ThemeData.LIGHT} fallback={<>radio_button_unchecked</>}>radio_button_checked</Show></Icon> Terang</div>
                                </button>
                                <button onClick={() => changeTheme(ThemeData.DARK)}>
                                    <div><Icon><Show when={store.settings.theme == ThemeData.DARK} fallback={<>radio_button_unchecked</>}>radio_button_checked</Show></Icon> Gelap</div>
                                </button>
                            </div>
                        </details>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={() => closeDialog(settingsDialogRef)}><div>Tutup</div></button>
                    </div>
                </div>
            </dialog>)
        }

        return (<>
            <PlaceDialogEl />
            <MemberDialogEl />
            <AboutDialogEl />
            <PlacesInfoDialogEl />
            <MembersInfoDialogEl />
            <ConfirmDeletePlacesDialogEl />
            <ConfirmDeleteMembersDialogEl />
            <SettingsDialogEl/>
        </>)
    }

    return (<>
        <TopBarEl />
        <BodyEl />
        <DialogEl />
    </>)
}