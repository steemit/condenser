import { getViewportDimensions } from './DomUtils';

class GptUtils {
    /**
     * Should we show the mobile version of an ad?
     *
     * @returns {boolean}
     */
    static ShowGptMobileSize() {
        return getViewportDimensions().w <= 768;
    }

    /**
     * Naively append-mobile to a given string representing an ad slot name.
     *
     * @param {string} slotName
     * @returns {string}
     */
    static MobilizeSlotName(slotName) {
        let mobileSlotAddendum = '';
        if (this.ShowGptMobileSize()) mobileSlotAddendum = '-mobile';
        return `${slotName}${mobileSlotAddendum}`;
    }

    /**
     * Takes an array of tags and determines whether one or more tags are banned from showing ads.
     *
     * @param {array[strings]} tags
     * @param {array[strings]} bannedTags
     * @returns {boolean}
     */
    static HasBannedTags(tags = [], bannedTags) {
        for (const tag of tags) {
            if (bannedTags.indexOf(tag) != -1) {
                return true;
            }
        }
        return false;
    }
}

export { GptUtils };
