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
}

export { GptUtils };
