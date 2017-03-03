import React from 'react';
import config from 'config';

export default function ServerHTML({ body, assets, locale, title, meta }) {
    let page_title = title;
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/images/favicons/apple-icon-57x57.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/images/favicons/apple-icon-114x114.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/images/favicons/apple-icon-72x72.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/images/favicons/apple-icon-144x144.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/images/favicons/apple-icon-60x60.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/images/favicons/apple-icon-120x120.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/images/favicons/apple-icon-76x76.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/images/favicons/apple-icon-152x152.png" type="image/png" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-96x96.png" sizes="96x96" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-32x32.png" sizes="32x32" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-16x16.png" sizes="16x16" />
            <meta name="application-name" content="Голос" />
            <meta name="msapplication-TileColor" content="#FFFFFF" />
            <meta name="msapplication-TileImage" content="/images/favicons/ms-icon-144x144.png" />
            <meta name="msapplication-square70x70logo" content="/images/favicons/ms-icon-70x70.png" />
            <meta name="msapplication-square150x150logo" content="/images/favicons/ms-icon-150x150.png" />
            <meta name="msapplication-wide310x150logo" content="/images/favicons/ms-icon-310x150.png" />
            <meta name="msapplication-square310x310logo" content="/images/favicons/ms-icon-310x310.png" />
            { assets.style.map((href, idx) =>
                <link href={href} key={idx} rel="stylesheet" type="text/css" />) }
            <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en"></script>
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
