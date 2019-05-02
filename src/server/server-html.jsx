import * as config from 'config';
import React from 'react';

export default function ServerHTML({
    body,
    assets,
    locale,
    title,
    meta,
    shouldSeeAds,
    adClient,
    gptEnabled,
    gptBidding,
}) {
    let page_title = title;
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                {meta &&
                    meta.map(m => {
                        if (m.title) {
                            page_title = m.title;
                            return null;
                        }
                        if (m.canonical)
                            return (
                                <link
                                    key="canonical"
                                    rel="canonical"
                                    href={m.canonical}
                                />
                            );
                        if (m.name && m.content)
                            return (
                                <meta
                                    key={m.name}
                                    name={m.name}
                                    content={m.content}
                                />
                            );
                        if (m.property && m.content)
                            return (
                                <meta
                                    key={m.property}
                                    property={m.property}
                                    content={m.content}
                                />
                            );
                        return null;
                    })}
                <link rel="manifest" href="/static/manifest.json" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
                <link
                    rel="apple-touch-icon-precomposed"
                    sizes="57x57"
                    href="/images/favicons/apple-touch-icon-57x57.png"
                    type="image/png"
                />
                <link
                    rel="apple-touch-icon-precomposed"
                    sizes="114x114"
                    href="/images/favicons/apple-touch-icon-114x114.png"
                    type="image/png"
                />
                <link
                    rel="apple-touch-icon-precomposed"
                    sizes="72x72"
                    href="/images/favicons/apple-touch-icon-72x72.png"
                    type="image/png"
                />
                <link
                    rel="apple-touch-icon-precomposed"
                    sizes="144x144"
                    href="/images/favicons/apple-touch-icon-144x144.png"
                    type="image/png"
                />
                <link
                    rel="apple-touch-icon-precomposed"
                    sizes="60x60"
                    href="/images/favicons/apple-touch-icon-60x60.png"
                    type="image/png"
                />
                <link
                    rel="apple-touch-icon-precomposed"
                    sizes="120x120"
                    href="/images/favicons/apple-touch-icon-120x120.png"
                    type="image/png"
                />
                <link
                    rel="apple-touch-icon-precomposed"
                    sizes="76x76"
                    href="/images/favicons/apple-touch-icon-76x76.png"
                    type="image/png"
                />
                <link
                    rel="apple-touch-icon-precomposed"
                    sizes="152x152"
                    href="/images/favicons/apple-touch-icon-152x152.png"
                    type="image/png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    href="/images/favicons/favicon-196x196.png"
                    sizes="196x196"
                />
                <link
                    rel="icon"
                    type="image/png"
                    href="/images/favicons/favicon-96x96.png"
                    sizes="96x96"
                />
                <link
                    rel="icon"
                    type="image/png"
                    href="/images/favicons/favicon-32x32.png"
                    sizes="32x32"
                />
                <link
                    rel="icon"
                    type="image/png"
                    href="/images/favicons/favicon-16x16.png"
                    sizes="16x16"
                />
                <link
                    rel="icon"
                    type="image/png"
                    href="/images/favicons/favicon-128.png"
                    sizes="128x128"
                />
                <meta name="application-name" content="Steemit" />
                <meta name="msapplication-TileColor" content="#FFFFFF" />
                <meta
                    name="msapplication-TileImage"
                    content="/images/favicons/mstile-144x144.png"
                />
                <meta
                    name="msapplication-square70x70logo"
                    content="/images/favicons/mstile-70x70.png"
                />
                <meta
                    name="msapplication-square150x150logo"
                    content="/images/favicons/mstile-150x150.png"
                />
                <meta
                    name="msapplication-wide310x150logo"
                    content="/images/favicons/mstile-310x150.png"
                />
                <meta
                    name="msapplication-square310x310logo"
                    content="/images/favicons/mstile-310x310.png"
                />
                <link
                    href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600"
                    rel="stylesheet"
                    type="text/css"
                />
                <link
                    href="https://fonts.googleapis.com/css?family=Source+Serif+Pro:400,600"
                    rel="stylesheet"
                    type="text/css"
                />
                {assets.style.map((href, idx) => (
                    <link
                        href={href}
                        key={idx}
                        rel="stylesheet"
                        type="text/css"
                    />
                ))}
                {gptEnabled ? (
                    <script
                        async
                        src="https://www.googletagservices.com/tag/js/gpt.js"
                    />
                ) : null}
                {gptEnabled ? (
                    <script src="https://staticfiles.steemit.com/prebid2.12.0.js" />
                ) : null}
                {gptEnabled ? (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                              // window.googletag = window.googletag || {};
                              // googletag.cmd = googletag.cmd || [];
                              // console.info('Set up googletag');
                              // googletag.cmd.push(function() {
                              //     // googletag.pubads().setTargeting('edition',['new-york']);
                              //     googletag.pubads().collapseEmptyDivs(true,true);
                              //     googletag.pubads().disableInitialLoad();
                              //     googletag.enableServices();
                              //     console.info('Enabled googletag services');
                              // });





                                console.log('IN THE SERVER CODE STUFFS');

                                var PREBID_TIMEOUT = 2000;
                                var FAILSAFE_TIMEOUT = 3000;
                                var adUnits = [
                                  {
                                    code: "div-gpt-ad-1551233873698-0",
                                    mediaTypes: {
                                      banner: {
                                        sizes: [728, 90]
                                      }
                                    },
                                    bids: [
                                      {
                                        bidder: "coinzilla",
                                        params: {
                                          placementId: "6425c7b9886e0045972"
                                        }
                                      }
                                    ]
                                  },
                                  {
                                    code: "div-gpt-ad-1554687231046-0",
                                    mediaTypes: {
                                      banner: {
                                        sizes: [160, 600]
                                      }
                                    },
                                    bids: [
                                      {
                                        bidder: "coinzilla",
                                        params: {
                                          placementId: "3575c7b9886e2cb3619"
                                        }
                                      }
                                    ]
                                  }
                                ];
                                const customConfigObject = {
                                  buckets: [
                                    {
                                      precision: 2,
                                      min: 0,
                                      max: 1,
                                      increment: 0.05
                                    },
                                    {
                                      precision: 2,
                                      min: 1,
                                      max: 8,
                                      increment: 0.1
                                    }
                                  ]
                                };
                                const systemCurrency = {
                                  adServerCurrency: "USD",
                                  granularityMultiplier: 1
                                };

                                var googletag = googletag || {};
                                googletag.cmd = googletag.cmd || [];

                                googletag.cmd.push(function() {
                                  googletag.pubads().disableInitialLoad();
                                });

                                var pbjs = pbjs || {};
                                pbjs.que = pbjs.que || [];

                                pbjs.que.push(function() {
                                  console.log('pbjs.que.push(function() {->IN THE SERVER CODE STUFFS');
                                  pbjs.addAdUnits(adUnits);
                                  pbjs.setConfig({
                                    priceGranularity: customConfigObject,
                                    currency: systemCurrency
                                  });
                                  pbjs.requestBids({
                                    bidsBackHandler: initAdserver,
                                    timeout: PREBID_TIMEOUT
                                  });
                                });

                                function initAdserver() {
                                  console.log('function initAdserver() {')
                                  if (pbjs.initAdserverSet) return;
                                  pbjs.initAdserverSet = true;
                                  googletag.cmd.push(function() {
                                    pbjs.que.push(function() {
                                      console.log('pbjs.que.push(function() {')
                                      pbjs.setTargetingForGPTAsync();
                                      googletag.pubads().refresh();
                                    });
                                  });
                                }

                                setTimeout(function() {
                                  initAdserver();
                                }, FAILSAFE_TIMEOUT);

                                googletag.cmd.push(function() {
                                  googletag
                                    .defineSlot(
                                      "/21784675435/steemit_bottom-of-post/steemit_bottom-of-post_prebid",
                                      [[728, 90]],
                                      "div-gpt-ad-1551233873698-0"
                                    )
                                    .addService(googletag.pubads());
                                  googletag
                                    .defineSlot(
                                      "/21784675435/steemit_left-navigation/steemit_left-navigation_prebid",
                                      [[120, 600], [160, 600]],
                                      "div-gpt-ad-1554687231046-0"
                                    )
                                    .addService(googletag.pubads());
                                  googletag.pubads().enableSingleRequest();
                                  googletag.enableServices();
                                });















/*
                              var pbjs = pbjs || {};
                              pbjs.que = pbjs.que || [];
                              pbjs.que.push(function() {
                                  pbjs.addAdUnits(${JSON.stringify(
                                      gptBidding.ad_units
                                  )});
                                  pbjs.setConfig({
                                      priceGranularity: ${JSON.stringify(
                                          gptBidding.custom_config
                                      )},
                                      currency: ${JSON.stringify(
                                          gptBidding.system_currency
                                      )}
                                  });
                                  pbjs.requestBids({
                                      bidsBackHandler: initAdserver,
                                      timeout: ${JSON.stringify(
                                          gptBidding.prebid_timeout
                                      )}
                                  });
                              });

                              setTimeout(function() {
                                  if (pbjs.initAdserverSet) return;
                                  pbjs.initAdserverSet = true;
                                  googletag.cmd.push(function() {
                                      pbjs.que.push(function() {
                                          pbjs.setTargetingForGPTAsync();
                                          googletag.pubads().refresh();
                                      });
                                  });
                              }, ${JSON.stringify(
                                  gptBidding.failsafe_timeout
                              )});*/
                          `,
                        }}
                    />
                ) : null}
                {shouldSeeAds ? (
                    <script
                        async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
                    />
                ) : null}
                {shouldSeeAds ? (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                      (adsbygoogle = window.adsbygoogle || []).push({
                          google_ad_client: "${adClient}",
                          enable_page_level_ads: true
                      });
                  `,
                        }}
                    />
                ) : null}
                <title>{page_title}</title>
            </head>
            <body>
                {
                    <div
                        id="content"
                        dangerouslySetInnerHTML={{ __html: body }}
                    />
                }
                {
                    <div
                        id="content"
                        dangerouslySetInnerHTML={{
                            __html: `
                  <p>Ad 160x600 (or 120x600) - for left side</p>
                  <br />
                  <div id="div-gpt-ad-1554687231046-0" style="width:160px; height:600px;">
                    <script>
                    window.addEventListener('load', ()=>{
                      googletag.cmd.push(function() {
                        googletag.display("div-gpt-ad-1554687231046-0");
                        console.log('inside display ad->div-gpt-ad-1554687231046-0')
                      });});
                    </script>
                  </div>

                  <br />
                  <p>Ad 728x90 for right side</p>
                  <br />
                  <div id="div-gpt-ad-1551233873698-0" style="height:90px; width:728px;">
                    <script>
                      googletag.cmd.push(function() {
                        googletag.display("div-gpt-ad-1551233873698-0");
                        console.log('inside display ad->div-gpt-ad-1551233873698-0')
                      });
                    </script>
                  </div>
                `,
                        }}
                    />
                }

                {assets.script.map((href, idx) => (
                    <script key={idx} src={href} />
                ))}
            </body>
        </html>
    );
}
