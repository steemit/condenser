// 3rd party plugins
export default function init(config) {

    (function (r, a, v, e, n) {
        e = r.createElement(a),
        n = r.getElementsByTagName(a)[0];
        e.async = 1;
        e.src = v;
        e.setAttribute("crossorigin", "anonymous");
        e.onreadystatechange = e.onload = function () {
            var state = e.readyState;
            if (! this.done && (! state || /loaded|complete/.test(state))) {
                this.done = true;
                try { Raven.config('https://b4bbf18029b54caead7b0cc7e76b94a1@sentry.io/222685').install(); } catch(e) {}
            }
        };
        n.parentNode.insertBefore(e, n);
    })(document, 'script', 'https://cdn.ravenjs.com/3.17.0/raven.min.js');
    
}
