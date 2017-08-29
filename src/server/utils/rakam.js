import config from 'config';

const rakam_id = config.get('rakam.rakam_id');

(function(e,t){var n=e.rakam||{};var r=t.createElement("script");r.type="text/javascript";
    r.async=true;r.src="https://d2f7xo8n6nlhxf.cloudfront.net/rakam.min.js";r.onload=function(){
        e.rakam.runQueuedFunctions()};var o=t.getElementsByTagName("script")[0];o.parentNode.insertBefore(r,o);
    function a(e,t){e[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
        return this}}var s=function(){this._q=[];return this};var i=["set","setOnce","increment","unset"];
    for(var c=0;c<i.length;c++){a(s.prototype,i[c])}n.User=s;n._q=[];var u=["init","logEvent","logInlinedEvent","setUserId","getUserId","getDeviceId","setSuperProperties","setOptOut","setVersionName","setDomain","setUserProperties","setDeviceId","onload","onEvent","startTimer"];
    for(var l=0;l<u.length;l++){a(n,u[l])}var m=["getTimeOnPreviousPage","getTimeOnPage","isReturningUser"];
    var v=(e.console?e.console.error||e.console.log:null)||function(){};var d=function(e){
        return function(){v("The method rakam."+e+"() must be called inside rakam.init callback function!");
        }};for(l=0;l<m.length;l++){n[m[l]]=d(m[l])}e.rakam=n})(window,document);

rakam.init({rakam_id}, {rakam_id}, {
    apiEndpoint: {rakam_url},
    includeUtm: true,
    trackClicks: true,
    trackForms: true,
    includeReferrer: true
});
