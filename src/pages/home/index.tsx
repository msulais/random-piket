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

export default () => {
    const files = useFiles()!
    const [store, setStore] = useStore()!
    const [message, setMessage] = createSignal<string>('')
    const [minMembers, setMinMembers] = createSignal<number>(0)
    const [maxMembers, setMaxMembers] = createSignal<number | string>(0)
    const [selectedPlaces, setSelectedPlaces] = createStore<number[]>([])
    const [selectedMembers, setSelectedMembers] = createStore<number[]>([])
    const [isEditing, setIsEditing] = createSignal<boolean>(false)
    const [index, setIndex] = createSignal<number>(0)
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
    let themeRef: HTMLDialogElement | undefined
    let aboutRef: HTMLDialogElement | undefined
    let membersInfoRef: HTMLDialogElement | undefined
    let placesInfoRef: HTMLDialogElement | undefined
    let confirmDeletePlacesRef: HTMLDialogElement | undefined
    let confirmDeleteMembersRef: HTMLDialogElement | undefined

    function openMembersInfoDialog(): void {
        membersInfoRef?.showModal()
    }

    function closeMembersInfoDialog(): void {
        membersInfoRef?.close()
    }

    function openPlacesInfoDialog(): void {
        placesInfoRef?.showModal()
    }

    function closePlacesInfoDialog(): void {
        placesInfoRef?.close()
    }

    function goToResultPage(): void {
        setStore('route', Routes.result)
    }

    function goToHistoryPage(): void {
        setStore('route', Routes.history)
    }

    function openAboutDialog(): void {
        aboutRef?.showModal()
    }

    function closeAboutDialog(): void {
        aboutRef?.close()
    }

    function openPlaceDialog(index: number | null): void {
        if (selectedPlacesCount() != 0) {
            if (index != null) selectOrUnselectPlace(null, store.data.places.at(index)!.id);
            return;
        }

        let isEditing: boolean = index != null
        setIsEditing(isEditing)

        if (isEditing) {
            setIndex(index!)
        }


        placeRefs.nameInput!.value = isEditing ? store.data.places[index!].name : ''
        placeRefs.minInput!.value = (isEditing ? store.data.places[index!].minMembers : store.settings.homePage.memberCountPerPlace.min) + ''
        placeRefs.maxInput!.value = (isEditing ? store.data.places[index!].maxMembers : store.settings.homePage.memberCountPerPlace.max) + ''

        placeRefs.dialog?.showModal()
    }

    function openMemberDialog(index: number | null): void {
        if (selectedMembersCount() != 0) {
            if (index != null) selectOrUnselectMember(null, store.data.members.at(index)!.id);
            return;
        }

        let isEditing: boolean = index != null
        setIsEditing(isEditing)

        if (isEditing) {
            setIndex(index!)
        }

        memberRefs.nameInput!.value = isEditing ? store.data.members[index!].name : ''
        if (memberRefs.fixedPlace) memberRefs.fixedPlace!.value = isEditing ? `${store.data.members[index!].fixedPlaceId}` : '-1'
        if (memberRefs.lastPlaces.a) memberRefs.lastPlaces.a!.value = isEditing ? `${store.data.members[index!].lastPlacesIds[0]}` : '-1'
        if (memberRefs.lastPlaces.b) memberRefs.lastPlaces.b!.value = isEditing ? `${store.data.members[index!].lastPlacesIds[1]}` : '-1'
        if (memberRefs.lastPlaces.c) memberRefs.lastPlaces.c!.value = isEditing ? `${store.data.members[index!].lastPlacesIds[2]}` : '-1'
        if (memberRefs.lastPlaces.d) memberRefs.lastPlaces.d!.value = isEditing ? `${store.data.members[index!].lastPlacesIds[3]}` : '-1'
        if (memberRefs.lastPlaces.e) memberRefs.lastPlaces.e!.value = isEditing ? `${store.data.members[index!].lastPlacesIds[4]}` : '-1'
        memberRefs.dialog?.showModal()
    }

    function savePlaceDialog(): void {
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
            const places = [...store.data.places];
            places[index()] = new Place(
                places[index()].id,
                placeRefs.nameInput!.value,
                Number.parseInt(placeRefs.minInput!.value),
                Number.parseInt(placeRefs.maxInput!.value)
            )
            setStore('data', 'places', places.sort((a, b) => a.name.localeCompare(b.name)))
        } else {
            let id: number = 0
            for (let place of store.data.places) {
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
            ].sort((a, b) => a.name.localeCompare(b.name)))

            setStore('settings', 'homePage', 'memberCountPerPlace', 'min', Number.parseInt(placeRefs.minInput!.value))
            setStore('settings', 'homePage', 'memberCountPerPlace', 'max', Number.parseInt(placeRefs.maxInput!.value))
        }

        files.settings.setCache('homePage.memberCountPerPlace.min', Number.parseInt(placeRefs.minInput!.value))
        files.settings.syncCache()
        files.data.setCache('places', [...store.data.places].map(v => v.toJSON()))
        files.data.syncCache()
        closePlaceDialog()
    }

    function saveMemberDialog(): void {
        if (memberRefs.nameInput!.value.trim() == '') {
            setMessage('Nama anggota tidak boleh kosong')
            return
        }

        if (isEditing()) {
            const members = [...store.data.members]
            members[index()] = new Member(
                members[index()].id,
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
            setStore('data', 'members', members.sort((a, b) => a.name.localeCompare(b.name)))
        } else {
            const members = memberRefs
                .nameInput!
                .value
                .trim()
                .split(',')
                .map(m => m.trim())
                .filter(m => m != '')

            if (members.length == 0) {
                setMessage('Nama anggota tidak boleh kosong')
                return
            }

            let id: number = 0
            for (let member of store.data.members) {
                if (member.id >= id) id = member.id + 1
            }

            setStore('data', 'members', _members => [
                ..._members,
                ...members.map(name => {
                    const member = new Member(id, name, null, null)
                    ++id
                    return member
                })
            ].sort((a, b) => a.name.localeCompare(b.name)))
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

    function deletePlaces(): void {
        confirmDeletePlacesRef?.showModal()
    }

    function confirmAlertDeletePlaces(): void {
        setStore(
            'data',
            'places',
            places => [...places.filter(p => !selectedPlaces.includes(p.id))]
            .sort((a, b) => a.name.localeCompare(b.name))
        );

        files.data.setCache('places', [...store.data.places].map(v => v.toJSON()))
        files.data.syncCache()
        unselectAllPlaces()
        closeAlertDeletePlaces()
    }

    function closeAlertDeletePlaces(): void {
        confirmDeletePlacesRef?.close()
    }

    function deleteMembers(): void {
        confirmDeleteMembersRef?.showModal()
    }

    function confirmAlertDeleteMembers(): void {
        setStore(
            'data',
            'members',
            members => [...members.filter(m => !selectedMembers.includes(m.id))]
            .sort((a, b) => a.name.localeCompare(b.name))
        );

        files.data.setCache('members', [...store.data.members].map(v => v.toJSON()))
        files.data.syncCache()
        unselectAllMembers()
        closeAlertDeleteMembers()
    }

    function closeAlertDeleteMembers(): void {
        confirmDeleteMembersRef?.close()
    }

    function selectAllPlaces(): void {
        setSelectedPlaces([...store.data.places.map(p => p.id)]);
    }

    function selectAllMembers(): void {
        setSelectedMembers([...store.data.members.map(m => m.id)]);
    }

    function unselectAllPlaces(): void {
        setSelectedPlaces([]);
    }

    function unselectAllMembers(): void {
        setSelectedMembers([]);
    }

    function selectOrUnselectPlace(event: ElementEvent<HTMLDivElement> | null, id: number): void {
        setSelectedPlaces(selectedPlaces.includes(id)
            ? [...selectedPlaces.filter(_id => _id != id)]
            : [...selectedPlaces, id]
        )

        if (event == null) return;
        event.stopPropagation();
    }

    function selectOrUnselectMember(event: ElementEvent<HTMLDivElement> | null, id: number): void {
        setSelectedMembers(selectedMembers.includes(id)
            ? [...selectedMembers.filter(_id => _id != id)]
            : [...selectedMembers, id]
        )

        if (event == null) return;
        event.stopPropagation();
    }

    function openTheme(): void {
        themeRef?.showModal()
    }

    function closeTheme(): void {
        themeRef?.close()
    }

    function selectTheme(theme: ThemeData): void {
        setStore('settings', 'theme', theme)
        files.settings.setCache('theme', theme)
        files.settings.syncCache()
    }

    function togglePlacesView(isGridView: boolean) {
        setStore('settings', 'homePage', 'places', 'gridView', isGridView)
        files.settings.setCache('homePage.places.gridView', isGridView)
        files.settings.syncCache()
    }

    function toggleMembersView(isGridView: boolean) {
        setStore('settings', 'homePage', 'members', 'gridView', isGridView)
        files.settings.setCache('homePage.members.gridView', isGridView)
        files.settings.syncCache()
    }

    createEffect(() => {
        let isLimitedQuota: boolean = true
        let minPlaceQuota: number = 0
        let maxPlaceQuota: number = 0

        for (const place of store.data.places) {
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
                <button onClick={openTheme}>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M501.231-310.769q70.231 0 119.731-49.5T670.462-480q0-70.231-49.5-119.731t-119.731-49.5q-18.298 0-35.765 4.115Q448-641 431.077-633.539q45.479 21.09 72.009 62.427 26.529 41.336 26.529 91.109 0 49.772-26.529 91.111-26.53 41.339-72.009 62.431Q448-319 465.466-314.884q17.467 4.115 35.765 4.115ZM480-83.384 362.75-200H200v-162.75L83.384-480 200-597.25V-760h162.75L480-876.616 597.25-760H760v162.75L876.616-480 760-362.75V-200H597.25L480-83.384ZM480-480Zm0 340 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Z" /></svg>
                    <span>Tema</span>
                </button>
                <button onClick={goToHistoryPage}>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M493-140q-133 0-231-84.5T152-440h56q14 106 94.197 176Q382.393-194 491-194q118 0 201-83.5t83-202Q775-598 692.918-682T493-766q-66.937 0-125.968 28.5Q308-709 267-658h106v54H179v-194h54v98q47-59 115.629-89.5T493-820q69.833 0 130.928 26.6 61.094 26.6 106.866 73.025 45.773 46.424 71.989 108.4Q829-550 829-480t-26.217 131.975q-26.216 61.976-71.989 108.4Q685.022-193.2 623.928-166.6 562.833-140 493-140Zm109-170L442-468v-228h54v204l144 144-38 38Z" /></svg>
                    <span>Histori</span>
                </button>
                <button onClick={openAboutDialog}>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M454-290h54v-230h-54v230Zm25.825-296q12.675 0 21.425-8.575 8.75-8.574 8.75-21.25 0-12.675-8.575-21.425-8.574-8.75-21.25-8.75-12.675 0-21.425 8.575-8.75 8.574-8.75 21.25 0 12.675 8.575 21.425 8.574 8.75 21.25 8.75Zm.349 486q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                    <span>Tentang aplikasi</span>
                </button>
            </div>
            <button class={topBarStyles.topBarTrailing} onClick={goToResultPage}>
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M201-341q-16-31-25.5-66t-9.5-72q0-123 82.5-213.5T452-794h68l-78-78 39-39 144 144-144 144-39-37 79-79h-68q-96 8-164.5 81.5T220-479q0 26 5.5 51.5T240-380l-39 39ZM479-53 335-197l144-144 39 37-79 79h68q96-8 164.5-81.5T740-485q0-26-5.5-51.5T720-584l39-39q16 31 25.5 66t9.5 72q0 123-82.5 213.5T508-170h-68l78 78-39 39Z" /></svg>
                <span>Buat</span>
            </button>
        </header>)
    }

    const BodyEl = () => {

        const PlacesEl = () => {

            const TopBar = () => (<div class={styles.sectionTopBar}>
                <h2>Tempat</h2>
                <div class={styles.sectionTopBarActions}>
                    <Show when={selectedPlacesCount() != 0}>
                        <p>{selectedPlacesCount()}/{placesCount()}</p>
                    </Show>
                    <Show
                        when={selectedPlacesCount() == 0}
                        fallback={<>
                            <Show when={store.data.places.length > selectedPlaces.length}>
                                <button title="Pilih semua" onClick={_ev => selectAllPlaces()}>
                                    <svg class='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m424-328 270-270-38-38-232 232-116-116-38 38 154 154ZM232-146q-36.725 0-61.363-24.637Q146-195.275 146-232v-496q0-36.725 24.637-61.362Q195.275-814 232-814h496q36.725 0 61.362 24.638Q814-764.725 814-728v496q0 36.725-24.638 61.363Q764.725-146 728-146H232Zm0-54h496q12 0 22-10t10-22v-496q0-12-10-22t-22-10H232q-12 0-22 10t-10 22v496q0 12 10 22t22 10Zm-32-560v560-560Z" /></svg>
                                </button>
                            </Show>
                            <button title="Hapus" onClick={_ev => deletePlaces()}>
                                <svg class='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M308-140q-37 0-61.5-24.5T222-226v-498h-40v-54h176v-36h246v36h176v54h-40v498q0 36.725-24.638 61.363Q690.725-140 654-140H308Zm378-584H276v498q0 14 9 23t23 9h346q12 0 22-10t10-22v-498ZM381-275h54v-368h-54v368Zm146 0h54v-368h-54v368ZM276-724v530-530Z" /></svg>
                            </button>
                            <button title="Batal edit" onClick={_ev => unselectAllPlaces()}>
                                <svg class='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m252-212-38-40 227-228-227-230 38-40 229 230 227-230 38 40-227 230 227 228-38 40-227-230-229 230Z" /></svg>
                            </button>
                        </>}
                    >
                        <Show
                            when={placesCount() != 0}
                            fallback={<button title="Tambah" onClick={() => openPlaceDialog(null)}>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M453-454H220v-54h233v-233h54v233h233v54H507v233h-54v-233Z" /></svg>
                            </button>}
                        >
                            <button title='Info' onClick={openPlacesInfoDialog}>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M454-290h54v-230h-54v230Zm25.825-296q12.675 0 21.425-8.575 8.75-8.574 8.75-21.25 0-12.675-8.575-21.425-8.574-8.75-21.25-8.75-12.675 0-21.425 8.575-8.75 8.574-8.75 21.25 0 12.675 8.575 21.425 8.574 8.75 21.25 8.75Zm.349 486q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                            </button>
                            <Show
                                when={store.settings.homePage.places.gridView}
                                fallback={<button title="Grid" onClick={_e => togglePlacesView(true)}>
                                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M226-140q-36.725 0-61.363-24.637Q140-189.275 140-226v-508q0-36.725 24.637-61.362Q189.275-820 226-820h507q36.725 0 61.362 24.638Q819-770.725 819-734v508q0 36.725-24.638 61.363Q769.725-140 733-140H226Zm0-54h125v-157H194v125q0 14 9 23t23 9Zm179 0h150v-157H405v157Zm204 0h124q14 0 23-9t9-23v-125H609v157ZM194-405h157v-150H194v150Zm211 0h150v-150H405v150Zm204 0h156v-150H609v150ZM194-609h157v-157H226q-14 0-23 9t-9 23v125Zm211 0h150v-157H405v157Zm204 0h156v-125q0-14-9-23t-23-9H609v157Z" /></svg>
                                </button>}
                            >
                                <button title='List' onClick={_e => togglePlacesView(false)}>
                                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M766-226v-110H194v110q0 14 9 23t23 9h508q14 0 23-9t9-23Zm0-164v-180H194v180h572Zm0-234v-110q0-14-9-23t-23-9H226q-14 0-23 9t-9 23v110h572ZM226-140q-36.725 0-61.363-24.637Q140-189.275 140-226v-508q0-36.725 24.637-61.362Q189.275-820 226-820h508q36.725 0 61.362 24.638Q820-770.725 820-734v508q0 36.725-24.638 61.363Q770.725-140 734-140H226Z" /></svg>
                                </button>
                            </Show>
                            <button title="Tambah" onClick={() => openPlaceDialog(null)}>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M453-454H220v-54h233v-233h54v233h233v54H507v233h-54v-233Z" /></svg>
                            </button>
                        </Show>
                    </Show>
                </div>
            </div>)

            const Body = () => (<Show
                when={placesCount() != 0}
                fallback={<div class={styles.sectionBodyEmpty}>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-97Q325-230 249.5-341T174-549q0-119 85-215.5T480.394-861q6.778 0 14.692.5Q503-860 510-859.325V-805q-7.5-1.5-15-2.25t-15-.75q-108 0-179.5 76.5T229-549q0 79 70 184.5T480-171q98-79 167.5-176.5T728-523q0 2 .5 4t.5 4h55.642q0-2-.321-4t-.321-4q-11 92-86 197T480-97Zm0-419Zm163-138 86-86 86 86 38-38-86-86 86-86-38-38-86 86-86-86-38 38 86 86-86 86 38 38ZM480.089-484Q509-484 529.5-504.589q20.5-20.588 20.5-49.5Q550-583 529.411-603.5q-20.588-20.5-49.5-20.5Q451-624 430.5-603.411q-20.5 20.588-20.5 49.5Q410-525 430.589-504.5q20.588 20.5 49.5 20.5Z" /></svg>
                    <h2>Belum ada tempat piket</h2>
                </div>}
            >
                <div
                    class={styles.sectionBodyItems}
                >
                    <div
                        data-list={!store.settings.homePage.places.gridView ? '' : undefined}
                    >
                        <For each={store.data.places}>{(place, i) =>
                            <div
                                data-selected={selectedPlaces.includes(place.id) ? '' : undefined}
                                class={styles.sectionBodyItem}
                                onDblClick={_ => openPlaceDialog(i())}
                                onClick={_ev => selectOrUnselectPlace(_ev, place.id)}
                            >
                                <h3>{place.name}</h3>
                                <p>{place.membersCountInString()}</p>
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
                <div class={styles.sectionTopBarActions}>
                    <Show when={selectedMembersCount() != 0}>
                        <p>{selectedMembersCount()}/{membersCount()}</p>
                    </Show>
                    <Show
                        when={selectedMembersCount() == 0}
                        fallback={<>
                            <Show when={store.data.members.length > selectedMembers.length}>
                                <button title="Pilih semua" onClick={_ev => selectAllMembers()}>
                                    <svg class='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m424-328 270-270-38-38-232 232-116-116-38 38 154 154ZM232-146q-36.725 0-61.363-24.637Q146-195.275 146-232v-496q0-36.725 24.637-61.362Q195.275-814 232-814h496q36.725 0 61.362 24.638Q814-764.725 814-728v496q0 36.725-24.638 61.363Q764.725-146 728-146H232Zm0-54h496q12 0 22-10t10-22v-496q0-12-10-22t-22-10H232q-12 0-22 10t-10 22v496q0 12 10 22t22 10Zm-32-560v560-560Z" /></svg>
                                </button>
                            </Show>
                            <button title="Hapus" onClick={_ev => deleteMembers()}>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>
                            </button>
                            <button title="Batal edit" onClick={_ev => unselectAllMembers()}>
                                <svg class='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m252-212-38-40 227-228-227-230 38-40 229 230 227-230 38 40-227 230 227 228-38 40-227-230-229 230Z" /></svg>
                            </button>
                        </>}
                    >
                        <Show
                            when={membersCount() != 0}
                            fallback={<button title="Tambah" onClick={() => openMemberDialog(null)}>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M453-454H220v-54h233v-233h54v233h233v54H507v233h-54v-233Z" /></svg>
                            </button>}
                        >
                            <button title='Info' onClick={openMembersInfoDialog}>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M454-290h54v-230h-54v230Zm25.825-296q12.675 0 21.425-8.575 8.75-8.574 8.75-21.25 0-12.675-8.575-21.425-8.574-8.75-21.25-8.75-12.675 0-21.425 8.575-8.75 8.574-8.75 21.25 0 12.675 8.575 21.425 8.574 8.75 21.25 8.75Zm.349 486q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                            </button>
                            <Show
                                when={store.settings.homePage.members.gridView}
                                fallback={<button title="Grid" onClick={_e => toggleMembersView(true)}>
                                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M226-140q-36.725 0-61.363-24.637Q140-189.275 140-226v-508q0-36.725 24.637-61.362Q189.275-820 226-820h507q36.725 0 61.362 24.638Q819-770.725 819-734v508q0 36.725-24.638 61.363Q769.725-140 733-140H226Zm0-54h125v-157H194v125q0 14 9 23t23 9Zm179 0h150v-157H405v157Zm204 0h124q14 0 23-9t9-23v-125H609v157ZM194-405h157v-150H194v150Zm211 0h150v-150H405v150Zm204 0h156v-150H609v150ZM194-609h157v-157H226q-14 0-23 9t-9 23v125Zm211 0h150v-157H405v157Zm204 0h156v-125q0-14-9-23t-23-9H609v157Z" /></svg>
                                </button>}
                            >
                                <button title='List' onClick={_e => toggleMembersView(false)}>
                                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M766-226v-110H194v110q0 14 9 23t23 9h508q14 0 23-9t9-23Zm0-164v-180H194v180h572Zm0-234v-110q0-14-9-23t-23-9H226q-14 0-23 9t-9 23v110h572ZM226-140q-36.725 0-61.363-24.637Q140-189.275 140-226v-508q0-36.725 24.637-61.362Q189.275-820 226-820h508q36.725 0 61.362 24.638Q820-770.725 820-734v508q0 36.725-24.638 61.363Q770.725-140 734-140H226Z" /></svg>
                                </button>
                            </Show>
                            <button title="Tambah" onClick={() => openMemberDialog(null)}>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M453-454H220v-54h233v-233h54v233h233v54H507v233h-54v-233Z" /></svg>
                            </button>
                        </Show>
                    </Show>
                </div>
            </div>)

            const Body = () => (<Show
                when={membersCount() != 0}
                fallback={<div class={styles.sectionBodyEmpty}>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m696-457-39-39 85-84-85-83 39-38 84 84 83-84 38 38-82 83 82 84-38 39-83-83-84 83Zm-336-67q-54.55 0-92.275-37.725Q230-599.45 230-654q0-54.55 37.725-92.275Q305.45-784 360-784q54.55 0 92.275 37.725Q490-708.55 490-654q0 54.55-37.725 92.275Q414.55-524 360-524ZM62-171v-83q0-29 15.688-52.854Q93.374-330.708 120-344q59-29 119.408-43.5 60.407-14.5 120.5-14.5Q420-402 480.5-387.5T600-344q26.625 13.292 42.312 37.146Q658-283 658-254v83H62Zm54-54h488v-29q0-14-7.5-24.5T575-296q-49-23-105.187-37.5T360-348q-53.626 0-109.813 14.5Q194-319 145-296q-14 7-21.5 17.5T116-254v29Zm244-353q32 0 54-22t22-54q0-32-22-54t-54-22q-32 0-54 22t-22 54q0 32 22 54t54 22Zm0-76Zm0 429Z" /></svg>
                    <h2>Belum ada anggota piket</h2>
                </div>}
            >
                <div
                    class={styles.sectionBodyItems}
                >
                    <div
                        data-edit={selectedMembersCount() != 0 ? '' : undefined}
                        data-list={!store.settings.homePage.members.gridView ? '' : undefined}
                    >
                        <For each={store.data.members}>{(member, i) =>
                            <div
                                data-selected={selectedMembers.includes(member.id) ? '' : undefined}
                                class={styles.sectionBodyItem}
                                onDblClick={_ev => openMemberDialog(i())}
                                onClick={ev => selectOrUnselectMember(ev, member.id)}
                            >
                                <h3>{member.name}</h3>
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
                        <Show when={message().trim() != ''}>
                            <p innerHTML={message()}></p>
                        </Show>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closePlaceDialog}>Batal</button>
                        <button onClick={savePlaceDialog}>
                            <Show when={isEditing()} fallback={<>Buat</>}>Simpan</Show>
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
                                    <For each={store.data.places}>{p =>
                                        <option value={p.id}>{p.name}</option>
                                    }</For>
                                </select>
                                <div title='Pilih tempat khusus yang pasti digunakan oleh anggota ini'>
                                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M454-290h54v-230h-54v230Zm25.825-296q12.675 0 21.425-8.575 8.75-8.574 8.75-21.25 0-12.675-8.575-21.425-8.574-8.75-21.25-8.75-12.675 0-21.425 8.575-8.75 8.574-8.75 21.25 0 12.675 8.575 21.425 8.574 8.75 21.25 8.75Zm.349 486q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                                </div>
                            </div>
                            <div class={styles.memberDialogLastPlaces}>
                                <p>Terakhir kali ditempatkan:</p>
                                <div>
                                    <select name="a" ref={memberRefs.lastPlaces.a}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={store.data.places}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                    <select name="b" ref={memberRefs.lastPlaces.b}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={store.data.places}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                    <select name="c" ref={memberRefs.lastPlaces.c}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={store.data.places}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                    <select name="d" ref={memberRefs.lastPlaces.d}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={store.data.places}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                    <select name="e" ref={memberRefs.lastPlaces.e}>
                                        <option value="-1">Tidak ada</option>
                                        <For each={store.data.places}>{p =>
                                            <option value={p.id}>{p.name}</option>
                                        }</For>
                                    </select>
                                </div>
                            </div>
                        </>}>
                            <div class={styles.memberDialogInfo}>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M454-290h54v-230h-54v230Zm25.825-296q12.675 0 21.425-8.575 8.75-8.574 8.75-21.25 0-12.675-8.575-21.425-8.574-8.75-21.25-8.75-12.675 0-21.425 8.575-8.75 8.574-8.75 21.25 0 12.675 8.575 21.425 8.574 8.75 21.25 8.75Zm.349 486q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                                <p>Boleh juga memasukkan banyak nama anggota sekaligus (dipisah dengan koma <code>,</code>).</p>
                            </div>
                        </Show>
                        <Show when={message().trim() != ''}>
                            <p class={styles.errorMessage} innerHTML={message()}></p>
                        </Show>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeMemberDialog}>Batal</button>
                        <button onClick={saveMemberDialog}>
                            <Show when={isEditing()} fallback={<>Buat</>}>Simpan</Show>
                        </button>
                    </div>
                </div>
            </dialog>)
        }

        const ThemeDialogEl = () => {
            return (<dialog ref={themeRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Tema</h2>
                    <div class={styles.themeDialog}>
                        <button onClick={_ => selectTheme(ThemeData.system)}>
                            <Show when={store.settings.theme == ThemeData.system} fallback={
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480.174-100q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                            }>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-304q73.62 0 124.81-51.19T656-480q0-73.62-51.19-124.81T480-656q-73.62 0-124.81 51.19T304-480q0 73.62 51.19 124.81T480-304Zm.174 204q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                            </Show>
                            <span>System</span>
                        </button>
                        <button onClick={_ => selectTheme(ThemeData.light)}>
                            <Show when={store.settings.theme == ThemeData.light} fallback={
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480.174-100q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                            }>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-304q73.62 0 124.81-51.19T656-480q0-73.62-51.19-124.81T480-656q-73.62 0-124.81 51.19T304-480q0 73.62 51.19 124.81T480-304Zm.174 204q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                            </Show>
                            <span>Terang</span>
                        </button>
                        <button onClick={_ => selectTheme(ThemeData.dark)}>
                            <Show when={store.settings.theme == ThemeData.dark} fallback={
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480.174-100q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                            }>
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-304q73.62 0 124.81-51.19T656-480q0-73.62-51.19-124.81T480-656q-73.62 0-124.81 51.19T304-480q0 73.62 51.19 124.81T480-304Zm.174 204q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z" /></svg>
                            </Show>
                            <span>Gelap</span>
                        </button>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeTheme}>Tutup</button>
                    </div>
                </div>
            </dialog>)
        }

        const AboutDialogEl = () => {
            return (<dialog ref={aboutRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Tentang Aplikasi</h2>
                    <div class={styles.aboutDialog}>
                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"> <defs> <linearGradient gradientUnits="objectBoundingBox" x1="0.20621875" y1="0.49999985" x2="0.68325317" y2="0.49999985" id="gradient_1"> <stop offset="0%" stop-color="#7B6700" /> <stop offset="100%" stop-color="#FFD600" /> </linearGradient> <linearGradient gradientUnits="objectBoundingBox" x1="0.59498703" y1="0.50450987" x2="2.9156922E-07" y2="0.4999998" id="gradient_2"> <stop offset="0%" stop-color="#1EB25B" /> <stop offset="100%" stop-color="#00973F" /> </linearGradient> <path d="M1024 0L1024 0L1024 1024L0 1024L0 0L1024 0Z" id="path_1" /> <clipPath id="clip_1"> <use href="#path_1" clip-rule="evenodd" fill-rule="evenodd" /> </clipPath> </defs> <g id="icon" clip-path="url(#clip_1)"> <path d="M1024 0L1024 0L1024 1024L0 1024L0 0L1024 0Z" id="icon" fill="none" stroke="none" /> <path d="M954 461L954 461L954 760C954 799.77 921.77 832 882 832L630.673 832C590.903 832 558.673 799.77 558.673 760L558.673 533C558.673 493.23 590.903 461 630.673 461L954 461Z" id="Rectangle-2-Copy-2" fill="url(#gradient_1)" stroke="none" /> <path d="M720.309 461L720.309 461L720.309 856C720.309 895.77 688.079 928 648.309 928L368.663 928C328.893 928 296.663 895.77 296.663 856L296.663 533C296.663 493.23 328.893 461 368.663 461L720.309 461Z" id="Rectangle-2" fill="url(#gradient_2)" stroke="none" /> <path d="M426 461L426 461L426 952C426 991.77 393.77 1024 354 1024L141 1024C101.23 1024 69 991.77 69 952L69 461L426 461Z" id="Rectangle-2-Copy" fill="#00E676" stroke="none" /> <path d="M550 0C589.77 0 622 32.2301 622 72L622 389C622 428.77 589.77 461 550 461L474 461C434.23 461 402 428.77 402 389L402 72C402 32.2301 434.23 0 474 0L550 0Z" id="Rectangle-3" fill="#2C7DFF" stroke="none" /> <path d="M882 301C921.77 301 954 333.23 954 373L954 512L69 512L69 373C69 333.23 101.23 301 141 301L882 301Z" id="Rectangle-3-Copy-2" fill="#448CFF" stroke="none" /> </g> </svg>
                        <div>
                            <h3>Random Piket</h3>
                            <p>Versi: 0.1.0</p>
                            <p>Dibuat oleh <a target="_blank" rel="noopener noreferrer" href="https://msulais.github.io">Muhammad Sulais</a></p>
                        </div>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeAboutDialog}>Tutup</button>
                        <a target="_blank" rel="noopener noreferrer" href="https://github.com/msulais/random-piket">Source code</a>
                    </div>
                </div>
            </dialog>)
        }

        const PlacesInfoDialogEl = () => {
            return (<dialog ref={placesInfoRef} class={dialogStyles.dialog}>
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
                        <button onClick={closePlacesInfoDialog}>Tutup</button>
                    </div>
                </div>
            </dialog>)
        }

        const MembersInfoDialogEl = () => {
            return (<dialog ref={membersInfoRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Info anggota</h2>
                    <div class={styles.infoDialog}>
                        <p>Banyak anggota: {store.data.members.length}</p>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeMembersInfoDialog}>Tutup</button>
                    </div>
                </div>
            </dialog>)
        }

        const ConfirmDeletePlacesDialogEl = () => {
            return (<dialog ref={confirmDeletePlacesRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Hapus tempat</h2>
                    <div class={styles.messageDialog}>
                        <p>Anda yakin ingin menghapus tempat yang terpilih?</p>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeAlertDeletePlaces}>Batal</button>
                        <button onClick={confirmAlertDeletePlaces}>Hapus</button>
                    </div>
                </div>
            </dialog>)
        }

        const ConfirmDeleteMembersDialogEl = () => {
            return (<dialog ref={confirmDeleteMembersRef} class={dialogStyles.dialog}>
                <div>
                    <h2>Hapus anggota</h2>
                    <div class={styles.messageDialog}>
                        <p>Anda yakin ingin menghapus anggota yang terpilih?</p>
                    </div>
                    <div class={dialogStyles.dialogActions}>
                        <button onClick={closeAlertDeleteMembers}>Batal</button>
                        <button onClick={confirmAlertDeleteMembers}>Hapus</button>
                    </div>
                </div>
            </dialog>)
        }

        return (<>
            <PlaceDialogEl />
            <MemberDialogEl />
            <ThemeDialogEl />
            <AboutDialogEl />
            <PlacesInfoDialogEl />
            <MembersInfoDialogEl />
            <ConfirmDeletePlacesDialogEl />
            <ConfirmDeleteMembersDialogEl />
        </>)
    }

    return (<>
        <TopBarEl />
        <BodyEl />
        <DialogEl />
    </>)
}