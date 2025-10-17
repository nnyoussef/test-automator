export function useCollapsibleTransition(maxHeight: number, duration: number) {
    const transition = `height ${duration}ms linear`;

    const beforeEnter = (el: Element) => {
        const e = el as HTMLElement;
        e.style.height = '0';
        e.style.overflow = 'hidden';
    };

    const enter = (el: Element) => {
        const e = el as HTMLElement;
        const calculatedHeight = Math.min(e.scrollHeight, maxHeight);
        e.style.transition = transition;
        e.style.height = `${calculatedHeight}px`;
    };

    const afterEnter = (el: Element) => {
        const e = el as HTMLElement;
        e.style.overflow = 'auto';
        e.style.transition = '';
        e.style.height = 'auto';
    };

    const beforeLeave = (el: Element) => {
        const e = el as HTMLElement;
        const calculatedHeight = Math.min(e.scrollHeight, maxHeight);
        e.style.height = `${calculatedHeight}px`;
        e.style.overflow = 'hidden';
    };

    const leave = (el: Element) => {
        const e = el as HTMLElement;
        e.style.transition = transition;
        requestAnimationFrame(() => {
            e.style.height = '0';
        });
    };

    return {
        beforeEnter,
        enter,
        afterEnter,
        beforeLeave,
        leave,
    };
}
