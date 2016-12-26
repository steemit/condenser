import React from 'react';
import config from 'config';

export default function ServerHTML({ body, assets, locale, title, meta }) {
    let page_title = title;
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="verify-reformal" content="be927bca44610c3531b44df8" />
            <meta name="yandex-verification" content="b136656e02d53064" />
            {
                meta && meta.map(m => {
                    if (m.title) {
                        page_title = m.title;
                        return null;
                    }
                    if (m.canonical)
                        return <link key="canonical" rel="canonical" href={m.canonical} />;
                    if (m.name && m.content)
                        return <meta key={m.name} name={m.name} content={m.content} />;
                    if (m.property && m.content)
                        return <meta key={m.property} property={m.property} content={m.content} />;
                    if (m.name && m.content)
                        return <meta key={m.name} name={m.name} content={m.content} />;
                    return null;
                })
            }
            {/* this is 'intl' polyfill for safari browser */}
            {/* it is must be loaded before main javascript file */}
            <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en,Intl.~locale.ru,Intl.~locale.ua"></script>
            {/* old steemit favicons (keep them here as placeholder to make sure new ones work properly) */}
            {/* <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/images/favicons/apple-touch-icon-57x57.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/images/favicons/apple-touch-icon-114x114.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/images/favicons/apple-touch-icon-72x72.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/images/favicons/apple-touch-icon-144x144.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/images/favicons/apple-touch-icon-60x60.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/images/favicons/apple-touch-icon-120x120.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/images/favicons/apple-touch-icon-76x76.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/images/favicons/apple-touch-icon-152x152.png" type="image/png" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-196x196.png" sizes="196x196" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-96x96.png" sizes="96x96" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-32x32.png" sizes="32x32" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-16x16.png" sizes="16x16" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-128.png" sizes="128x128" />
            <meta name="application-name" content="Steemit" />
            <meta name="msapplication-TileColor" content="#FFFFFF" />
            <meta name="msapplication-TileImage" content="/images/favicons/mstile-144x144.png" />
            <meta name="msapplication-square70x70logo" content="/images/favicons/mstile-70x70.png" />
            <meta name="msapplication-square150x150logo" content="/images/favicons/mstile-150x150.png" />
            <meta name="msapplication-wide310x150logo" content="/images/favicons/mstile-310x150.png" />
            <meta name="msapplication-square310x310logo" content="/images/favicons/mstile-310x310.png" /> */}

            {/* new steemit icons */}
            <link rel="icon" type="image/x-icon" href="/images/favicons/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-touch-icon.png" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-32x32.png" sizes="32x32" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-16x16.png" sizes="16x16" />
            <link rel="manifest" href="/images/favicons/manifest.json" />
            <link rel="mask-icon" href="/images/favicons/safari-pinned-tab.svg" color="#5bbad5" />
            <meta name="theme-color" content="#ffffff" />

            <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
            {/* animate.css were added for landing page */}
            <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css" rel="stylesheet" />

            { assets.style.map((href, idx) =>
                <link href={href} key={idx} rel="stylesheet" type="text/css" />) }
            <title>{page_title}</title>
        </head>
        <body>
        <div id="content" dangerouslySetInnerHTML={ { __html: body } }></div>
        {assets.script.map((href, idx) => <script key={ idx } src={ href }></script>) }
        {config.js_plugins_path && <script src={config.js_plugins_path}></script>}
        </body>
        </html>
    );
}
