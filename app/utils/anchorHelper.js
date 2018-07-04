
export function init() {
    window.addEventListener('hashchange', () => {
        tryMoveToAnchor();
    });

    let testsCount = 0;
    const interval = setInterval(() => {
        tryMoveToAnchor();

        if (++testsCount === 10) {
            clearInterval(interval);
        }
    }, 100);
}

function tryMoveToAnchor() {
    const hash = location.hash.substr(1);

    if (hash) {
        const anchor = document.getElementById(hash);

        if (anchor) {
            if (anchor.scrollIntoViewIfNeeded) {
                anchor.scrollIntoViewIfNeeded();
            } else if (anchor.scrollIntoView) {
                anchor.scrollIntoView();
            }

            const bound = anchor.getBoundingClientRect();

            const delta = 120 + window.innerHeight / 6 - Math.round(bound.top);

            if (delta > 0) {
                document.scrollingElement.scrollTop -= delta;
            }
        }
    }
}
