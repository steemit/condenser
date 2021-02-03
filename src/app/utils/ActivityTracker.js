import Cookies from 'js-cookie';
import { recordActivityTracker } from 'app/utils/ServerApiClient';

const cookieName = 'activity_tag';
const expiresTime = 30;

export default function(tagName, trackingId) {
    console.log('cookie tagname:', tagName, trackingId);
    // white list
    const tagList = window.activityTag ? window.activityTag : [];
    if (tagList.indexOf(tagName) === -1) {
        return;
    }

    // location info
    const hostname = window.location.hostname;
    const host = window.location.host;
    const locationInfo = hostname.split('.').reverse();
    const domain =
        ['localhost', '127.0.0.1'].indexOf(hostname) === -1
            ? `.${locationInfo[1]}.${locationInfo[0]}`
            : hostname;
    const pathname = window.location.pathname;
    const referrer = document.referrer;

    // if (referrer === '' || referrer.indexOf(host) !== -1) {
    //     console.log('referrer: not_from_outside', referrer, hostname);
    //     return;
    // }
    console.log('cookie location info:', domain, referrer);

    // get cookie
    const activityTag = Cookies.getJSON(cookieName);

    // check if exist cookie
    if (activityTag === undefined) {
        const data = {};
        data[tagName] = { isVisit: 0, isReg: 0 };
        Cookies.set(cookieName, data, { expires: expiresTime, domain });
    } else if (Object.keys(activityTag).indexOf(tagName) === -1) {
        activityTag[tagName] = { isVisit: 0, isReg: 0 };
        Cookies.set(cookieName, activityTag, { expires: expiresTime, domain });
    }

    // record
    recordActivityTracker({
        trackingId,
        activityTag: tagName,
        pathname,
        referrer,
    });
}
