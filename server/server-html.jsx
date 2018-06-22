import React from 'react';
import { LIQUID_TOKEN } from 'app/client_config';
import config from 'config';
//import AnalyticsScripts from 'app/components/elements/AnalyticsScripts';

export default function ServerHTML({ body, assets, locale, title, meta, analytics }) {
    let page_title = title;
    return (
        <html>
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
            <link rel="manifest" href="/static/manifest.json" />
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/images/favicons/apple-icon-57x57.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/images/favicons/apple-icon-114x114.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/images/favicons/apple-icon-72x72.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/images/favicons/apple-icon-144x144.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/images/favicons/apple-icon-60x60.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/images/favicons/apple-icon-120x120.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/images/favicons/apple-icon-76x76.png" type="image/png" />
            <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/images/favicons/apple-icon-152x152.png" type="image/png" />
            {/*<link rel="icon" type="image/png" href="/images/favicons/favicon-196x196.png" sizes="196x196" />*/}
            <link rel="icon" type="image/png" href="/images/favicons/favicon-96x96.png" sizes="96x96" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-32x32.png" sizes="32x32" />
            <link rel="icon" type="image/png" href="/images/favicons/favicon-16x16.png" sizes="16x16" />
            {/*<link rel="icon" type="image/png" href="/images/favicons/favicon-128.png" sizes="128x128" />*/}
            <meta name="application-name" content={LIQUID_TOKEN} />
            <meta name="msapplication-TileColor" content="#FFFFFF" />
            <meta name="msapplication-TileImage" content="/images/favicons/ms-icon-144x144.png" />
            <meta name="msapplication-square70x70logo" content="/images/favicons/ms-icon-70x70.png" />
            <meta name="msapplication-square150x150logo" content="/images/favicons/ms-icon-150x150.png" />
            <meta name="msapplication-wide310x150logo" content="/images/favicons/ms-icon-310x150.png" />
            <meta name="msapplication-square310x310logo" content="/images/favicons/ms-icon-310x310.png" />

            {/* styles (will be present only in production with webpack extract text plugin) */}
            {Object.keys(assets.styles).map((style, i) =>
                <link href={assets.styles[style]} key={i} media="screen, projection"
                    rel="stylesheet" type="text/css" />)}

            {/* resolves the initial style flash (flicker) on page load in development mode */}
            {Object.keys(assets.styles).length === 0 ?
                <style dangerouslySetInnerHTML={{ __html: '#content{visibility:hidden}' }} /> : null}

            <title>{page_title}</title>
        </head>
        <body>
            {/* <AnalyticsScripts { ...analytics }/> */}
            <div id="content" dangerouslySetInnerHTML={ { __html: body } }></div>

            {/* javascripts */}
            {/* (usually one for each "entry" in webpack configuration) */}
            {/* (for more informations on "entries" see https://github.com/petehunt/webpack-howto/) */}
            {Object.keys(assets.javascript).map((script, i) =>
                <script src={assets.javascript[script]} key={i} />
            )}

            { config.get('vk_pixel_id') && <script dangerouslySetInnerHTML={ { __html: `(window.Image ? (new Image()) : document.createElement('img')).src = 'https://vk.com/rtrg?p=${config.get('vk_pixel_id')}';` } }></script> }
        </body>
        </html>
    );
}
