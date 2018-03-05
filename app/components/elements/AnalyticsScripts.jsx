import React from 'react'

const gaScript = (gaId) => `
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', '${gaId}', 'auto'); ga('send', 'pageview');
`

const metrikaScript = `
(function (d, w, c) {
  (w[c] = w[c] || []).push(function() {
      try {w.yaCounter41829924 = new Ya.Metrika2({ id:41829924, clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });} catch(e) { }
  });
  var n = d.getElementsByTagName("script")[0], s = d.createElement("script"), f = function () { n.parentNode.insertBefore(s, n); };
  s.type = "text/javascript"; s.async = true; s.src = "https://mc.yandex.ru/metrika/tag.js";
  if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
})(document, window, "yandex_metrika_callbacks2");
`

const fbSdk = (fbAppId) =>`
window.fbAsyncInit = function () { FB.init({ appId: ${fbAppId}, xfbml: true,  version: 'v2.9' });};
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.async = true; js.id = id; js.src = "//connect.facebook.net/en_US/sdk.js"; fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
`

const fbEvents = (fbAppId) => `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', ${fbAppId}); fbq('track', 'PageView');
`

export default function AnalyticsScripts({ google_analytics_id, facebook_app_id }) {
    return (
        <div>
            <script id="ga-script" dangerouslySetInnerHTML={ { __html: gaScript(google_analytics_id) } }></script>
            <script id="metrika-script" dangerouslySetInnerHTML={ { __html: metrikaScript } }></script>
            <script id="fbsdk-script" dangerouslySetInnerHTML={ { __html: fbSdk(facebook_app_id) } }></script>
            <script id="fbevents-script" dangerouslySetInnerHTML={ { __html: fbEvents(facebook_app_id) } }></script>
        </div>
    )
}
