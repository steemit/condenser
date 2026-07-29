/**
 * Shim for the `counterpart` i18n module used by legacy sources.
 * Maps the message keys used in the render pipeline to the exact English
 * strings the next implementation inlines (see lib/sanitize-config.ts and
 * lib/html-ready.ts), so pipeline outputs are comparable.
 */
const messages = {
  'g.phishy_message': '(Warning: link is a possible phishing attempt)',
  'g.external_link_message': 'This link will take you away from Steemit',
  'g.internal_image_message': '',
};

function tt(key) {
  return Object.prototype.hasOwnProperty.call(messages, key) ? messages[key] : key;
}

module.exports = tt;
module.exports.default = tt;
