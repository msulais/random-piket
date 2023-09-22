import { JSXElement, Show } from "solid-js"
import { MenuPosition } from "../../enums"
import { Portal } from "solid-js/web"
import { ElementEvent } from "../../types"
import styles from './index.module.scss'

export function closeAllMenu(){
    for (const menu of document.querySelectorAll('menu[data-open]')){
        menu.removeAttribute('data-open')
    }
}

export function openMenu<E = Element>(clickEvent: ElementEvent<E>, menuRef: HTMLMenuElement){
    if (document.querySelector('menu[data-open]')){
        return
    }

    clickEvent.stopPropagation()
    menuRef.setAttribute('data-open', '')
    menuRef.removeAttribute('style')

    const
        ELEMENT_RECT : DOMRect = (clickEvent!.currentTarget! as any).getBoundingClientRect(),
        MENU_RECT    : DOMRect = menuRef.getBoundingClientRect(),
        SCREEN_WIDTH : number = document.body.clientWidth,
        SCREEN_HEIGHT: number = window.innerHeight,
        MARGIN       : number = menuRef.getAttribute('data-margin')? /^-?\d+$/.test(menuRef.getAttribute('data-margin')!) ? Number.parseFloat(menuRef.getAttribute('data-margin')!) : 8 : 8,
        GAP          : number = menuRef.getAttribute('data-gap')? /^-?\d+$/.test(menuRef.getAttribute('data-gap')!) ? Number.parseFloat(menuRef.getAttribute('data-gap')!) : 8 : 8
    ;

    let
        top      : number = 0,
        left     : number = 0,
        right    : number = 0,
        bottom   : number = 0,
        width    : number = MENU_RECT.width,
        height   : number = MENU_RECT.height,
        maxWidth : number | undefined,
        maxHeight: number | undefined
    ;

    if (SCREEN_WIDTH < width){
        maxWidth = SCREEN_WIDTH - MARGIN * 2
        width = maxWidth
    }
    if (SCREEN_HEIGHT < height){
        maxHeight = SCREEN_HEIGHT - MARGIN * 2
        height = maxHeight
    }

    switch (menuRef.getAttribute('data-position')){
        case MenuPosition.TOP_LEFT:
            top = ELEMENT_RECT.top - height - GAP
            if (top < MARGIN) top = MARGIN

            left = ELEMENT_RECT.left
            right = SCREEN_WIDTH - left - width
            if (right < MARGIN) left = SCREEN_WIDTH - width - MARGIN
            break
        case MenuPosition.TOP_RIGHT:
            top = ELEMENT_RECT.top - height - GAP
            if (top < MARGIN) top = MARGIN

            left = ELEMENT_RECT.right - width
            if (left < MARGIN) left = MARGIN
            break
        case MenuPosition.TOP_CENTER:
            top = ELEMENT_RECT.top - height - GAP
            if (top < MARGIN) top = MARGIN

            left = ELEMENT_RECT.left - width / 2 + ELEMENT_RECT.width / 2
            right = SCREEN_WIDTH - left - width
            if (left < MARGIN) left = MARGIN
            if (right < MARGIN) left = SCREEN_WIDTH - width - MARGIN
            break
        case MenuPosition.BOTTOM_LEFT:
            top = ELEMENT_RECT.bottom + GAP
            bottom = SCREEN_HEIGHT - top - height
            if (bottom < MARGIN) top = SCREEN_HEIGHT - height - MARGIN

            left = ELEMENT_RECT.left
            right = SCREEN_WIDTH - left - width
            if (right < MARGIN) left = SCREEN_WIDTH - width - MARGIN
            break
        case MenuPosition.BOTTOM_RIGHT:
            top = ELEMENT_RECT.bottom + GAP
            bottom = SCREEN_HEIGHT - top - height
            if (bottom < MARGIN) top = SCREEN_HEIGHT - height - MARGIN

            left = ELEMENT_RECT.right - width
            if (left < MARGIN) left = MARGIN
            break
        case MenuPosition.BOTTOM_CENTER:
            top = ELEMENT_RECT.bottom + GAP
            bottom = SCREEN_HEIGHT - top - height
            if (bottom < MARGIN) top = SCREEN_HEIGHT - height - MARGIN

            left = ELEMENT_RECT.left - width / 2 + ELEMENT_RECT.width / 2
            right = SCREEN_WIDTH - left - width
            if (left < MARGIN) left = MARGIN
            if (right < MARGIN) left = SCREEN_WIDTH - width - MARGIN
            break
        case MenuPosition.LEFT_TOP:
            top = ELEMENT_RECT.top
            bottom = SCREEN_HEIGHT - top - height
            if (bottom < MARGIN) top = SCREEN_HEIGHT - height - MARGIN

            left = ELEMENT_RECT.left - width - GAP
            if (left < MARGIN) left = MARGIN
            break
        case MenuPosition.LEFT_BOTTOM:
            top = ELEMENT_RECT.bottom - height
            if (top < MARGIN) top = MARGIN

            left = ELEMENT_RECT.left - width - GAP
            if (left < MARGIN) left = MARGIN
            break
        case MenuPosition.LEFT_CENTER:
            top = ELEMENT_RECT.top - height / 2 + ELEMENT_RECT.height / 2
            bottom = SCREEN_HEIGHT - top - height
            if (top < MARGIN) top = MARGIN
            if (bottom < MARGIN) top = SCREEN_HEIGHT - height - MARGIN

            left = ELEMENT_RECT.left - width - GAP
            if (left < MARGIN) left = MARGIN
            break
        case MenuPosition.RIGHT_TOP:
            top = ELEMENT_RECT.top
            bottom = SCREEN_HEIGHT - top - height
            if (bottom < MARGIN) top = SCREEN_HEIGHT - height - MARGIN

            left = ELEMENT_RECT.right + GAP
            right = SCREEN_WIDTH - left - width
            if (right < MARGIN) left = SCREEN_WIDTH - width - MARGIN
            break
        case MenuPosition.RIGHT_BOTTOM:
            top = ELEMENT_RECT.bottom - height
            if (top < MARGIN) top = MARGIN

            left = ELEMENT_RECT.right + GAP
            right = SCREEN_WIDTH - left - width
            if (right < MARGIN) left = SCREEN_WIDTH - width - MARGIN
            break
        case MenuPosition.RIGHT_CENTER:
            top = ELEMENT_RECT.top - height / 2 + ELEMENT_RECT.height / 2
            bottom = SCREEN_HEIGHT - top - height
            if (top < MARGIN) top = MARGIN
            if (bottom < MARGIN) top = SCREEN_HEIGHT - height - MARGIN

            left = ELEMENT_RECT.right + GAP
            right = SCREEN_WIDTH - left - width
            if (right < MARGIN) left = SCREEN_WIDTH - width - MARGIN
            break
        default: // MenuPosition.BOTTOM_CENTER
            top = ELEMENT_RECT.bottom + GAP
            bottom = SCREEN_HEIGHT - top - height
            if (bottom < MARGIN) top = SCREEN_HEIGHT - height - MARGIN

            left = ELEMENT_RECT.left - width / 2 + ELEMENT_RECT.width / 2
            right = SCREEN_WIDTH - left - width
            if (left < MARGIN) left = MARGIN
            if (right < MARGIN) left = SCREEN_WIDTH - width - MARGIN
    }

    if (maxWidth) menuRef.style.maxWidth = maxWidth + 'px'
    if (maxHeight) menuRef.style.maxHeight = maxHeight + 'px'

    menuRef.style.top = top + 'px'
    menuRef.style.left = left + 'px'
}

export function MenuItemDivider(){
    return (<li><hr class={ styles.divider }/></li>)
}

type MenuItemButtonProps = {
    children: JSXElement
    leading?: JSXElement
    trailing?: JSXElement
    autoClose?: boolean
    onClick: (event: ElementEvent<HTMLButtonElement>) => void
}
export function MenuItemButton({children, onClick, autoClose = false, leading, trailing}: MenuItemButtonProps){
    return (<li><button class={ styles.button } onClick={(ev) => {onClick(ev); ev.stopPropagation(); if (autoClose) closeAllMenu()}}>
        <Show
            when={trailing}
            fallback={<div class={ styles.noTrailing }>
            <Show when={leading}>{leading}</Show>
            {children}
        </div>}>
            <div class={ styles.trailing }>
                <div>
                    <Show when={leading}>{leading}</Show>
                    {children}
                </div>
                { trailing }
            </div>
        </Show>
    </button></li>)
}

type Props = {
    children: JSXElement
    child: JSXElement
    menuRef: (ref: HTMLMenuElement) => {}
    position?: MenuPosition
    menuAttr?: object
    margin?: number
    gap?: number
    mount?: Node
}
export default ({
    children,
    child,
    margin = 8,
    gap = 8,
    menuAttr = {},
    mount = document.body,
    position = MenuPosition.BOTTOM_CENTER,
    menuRef
}: Props) => {
    return (<>
        { child }
        <Portal mount={ mount }><menu
            {...menuAttr}
            onClick={(ev) => ev.stopPropagation()}
            ref={ el => menuRef(el as HTMLMenuElement) }
            data-position={ position }
            data-gap={ gap }
            data-margin={ margin }>{
            children
        }</menu></Portal>
    </>)
}