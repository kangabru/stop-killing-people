import * as React from 'react';

/* Concatenates non-empty class names. */
export function Classes(...classes: (string | void)[]) {
    return classes.filter(c => !!c).join(" ")
}

/* Makes a word plural when value is appropriate. */
export function s(text: string, num: number) {
    return text + (num === 1 ? "" : "s")
}

/* Creates a full width container with a responsive inner container for content. */
export function Section(props: { children?: React.ReactNode, classContainer?: string, classContent?: string }) {
    return <div className={Classes("", props.classContainer)}>
        <div className={Classes("container mx-auto p-10", props.classContent)}>
            {props.children}
        </div>
    </div>
}