import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Iterable } from 'immutable';

/**
    Wrapper for PureRenderMixin.
    This allows debugging that will show which properties changed.
*/
export default function(instance, name) {
    const mixin = PureRenderMixin.shouldComponentUpdate.bind(instance);
    if (
        process.env.BROWSER &&
        window.steemDebug_shouldComponentUpdate === undefined
    ) {
        window.steemDebug_shouldComponentUpdate = false; // console command line completion
    }
    return (nextProps, nextState) => {
        const upd = mixin(nextProps, nextState);
        // Usage: steemDebug_shouldComponentUpdate = true
        // Or: steemDebug_shouldComponentUpdate = /Comment/
        if (
            upd &&
            process.env.BROWSER &&
            window.steemDebug_shouldComponentUpdate
        ) {
            const filter = window.steemDebug_shouldComponentUpdate;
            if (filter.test) {
                if (!filter.test(name)) return upd;
            }
            compare(name, instance.props, nextProps);
            compare(name, instance.state, nextState);
        }
        return upd;
    };
}

export function compare(name, a, b) {
    const aKeys = new Set(a && Object.keys(a));
    const bKeys = new Set(b && Object.keys(b));
    const ab = new Set([...aKeys, ...aKeys]);
    ab.forEach(key => {
        const hasA = aKeys.has(key);
        const hasB = bKeys.has(key);
        if (!hasA && !hasB) return;
        if (hasA && hasB && a[key] === b[key]) return;
        const desc = !hasA ? 'added' : !hasB ? 'removed' : 'changed';
        console.log(name, key, desc);
        const aKey = a[key];
        const bKey = b[key];
        if (typeof aKey !== 'function' && typeof bKey !== 'function') {
            //functions are too verbose
            console.log(key, 'was', a && toJS(aKey));
            console.log(key, 'is', b && toJS(bKey));
        }
    });
}

const toJS = o => (Iterable.isIterable(o) ? o.toJS() : o);
