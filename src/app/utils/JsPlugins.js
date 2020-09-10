// 3rd party plugins

// export default function init(config) {
//     if (config.google_analytics_id) {
//         (function(i, s, o, g, r, a, m) {
//             i['GoogleAnalyticsObject'] = r;
//             (i[r] =
//                 i[r] ||
//                 function() {
//                     (i[r].q = i[r].q || []).push(arguments);
//                 }),
//                 (i[r].l = 1 * new Date());
//             (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
//             a.async = 1;
//             a.src = g;
//             m.parentNode.insertBefore(a, m);
//         })(
//             window,
//             document,
//             'script',
//             'https://www.google-analytics.com/analytics.js',
//             'ga'
//         );
//         ga('create', {
//             trackingId: config.google_analytics_id,
//             cookieDomain: 'auto',
//             sampleRate: 5,
//         });
//     }
// }

export default function init(config) {
    if (config.google_analytics_id) {
        (function(w, d, n, u, p, f, a, m) {
            (a = d.createElement(n)), (m = d.getElementsByTagName(n)[0]);
            a.async = 1;
            a.src = u;
            m.parentNode.insertBefore(a, m);
            (w[p] = w[p] || []),
                (w[f] = function() {
                    w[p].push(arguments);
                });
        })(
            window,
            document,
            'script',
            `https://www.googletagmanager.com/gtag/js?id=${
                config.google_analytics_id
            }`,
            'dataLayer',
            'gtag'
        );
        gtag('js', new Date());
        gtag('config', config.google_analytics_id, {
            cookie_domain: 'auto',
            sample_rate: 5,
        });
    }
}
