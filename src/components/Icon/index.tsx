import { JSXElement } from "solid-js"

type Props = {
    children: JSXElement
    className?: string
}
export default ({ children, className }: Props) => {
    return (<span class={"icon " + (className ?? '') } translate="no">{ children }</span>)
}