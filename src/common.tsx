import * as React from 'react';

export function Classes(...classes: string[]) {
    return classes.filter(c => !!c).join(" ")
}

export function Section(props: { children?: React.ReactNode, classContainer?: string, classContent?: string }) {
    return <div className={Classes("", props.classContainer)}>
        <div className={Classes("container mx-auto p-10", props.classContent)}>
            {props.children}
        </div>
    </div>
}