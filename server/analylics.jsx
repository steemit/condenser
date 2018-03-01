import React from 'react'
import config from 'config'

const gaScript = `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', '${config.google_analytics_id}', 'auto');ga('send', 'pageview');`

const metrikaScript = `(function (d, w, c) {
  (w[c] = w[c] || []).push(function() {
      try {
          w.yaCounter41829924 = new Ya.Metrika2({
              id:41829924,
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true
          });
      } catch(e) { }
  });

  var n = d.getElementsByTagName("script")[0],
      s = d.createElement("script"),
      f = function () { n.parentNode.insertBefore(s, n); };
  s.type = "text/javascript";
  s.async = true;
  s.src = "https://mc.yandex.ru/metrika/tag.js";

  if (w.opera == "[object Opera]") {
      d.addEventListener("DOMContentLoaded", f, false);
  } else { f(); }
})(document, window, "yandex_metrika_callbacks2");`

export default function AnalyticsScripts() {
    return (
        <div>
            <script id="ga-script" dangerouslySetInnerHTML={ { __html: gaScript } }></script>
            <script id="metrika-script" dangerouslySetInnerHTML={ { __html: metrikaScript } }></script>
        </div>
        
    )
}
