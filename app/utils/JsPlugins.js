// 3rd party plugins
export default function init(config) {
  
    if (config.google_analytics_id) {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
            a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', config.google_analytics_id, 'auto');
    }

    if (config.facebook_app_id) {
        window.fbAsyncInit = function () {
            FB.init({
                appId: config.facebook_app_id,
                xfbml: true,
                version: 'v2.9'
            });
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s);
            js.async = true;
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    // // FACEBOOK CONNECT
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* Facebook Pixel Code */
    /* NOTE dont't forget to remove <img /> tag of facebook pixel (down below) */
    fbq('init', config.facebook_app_id); // Insert your pixel ID here.
    fbq('track', 'PageView');

    /* Yandex.Metrika counter */
    /* NOTE dont't forget to remove <img /> tag of yandex metrika (down below) */
    (function (d, w, c) {
        (w[c] = w[c] || []).push(function() {
          try {
            w.yaCounter41829924 = new Ya.Metrika({
              id:41829924,
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true
            });
          } catch(e) { }
        });
        var n = d.getElementsByTagName("script")[0],
        s = d.createElement("script"),
        f = function () { n.parentNode.insertBefore(s, n); };
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://mc.yandex.ru/metrika/watch.js";
  
        if (w.opera == "[object Opera]") {
          d.addEventListener("DOMContentLoaded", f, false);
        } else { f(); }
  })(window.document, window, "yandex_metrika_callbacks")
    /* /Yandex.Metrika counter */
}