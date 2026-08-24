/**
 * GDPR-blocked account names: these users exercised their right to be
 * forgotten, so every route family that exposes them must 404
 * (see proxy.ts). Ported verbatim from master's
 * src/app/utils/GDPRUserList.js.
 */
const gdprUserList: string[] = [
  'mateja.klaric',
  'xondra',
  'tgylhn',
  'vichkovski',
  'wizzymt',
  'thedarkoverlord',
  'twoblokestrading',
  'ruttydm',
  'mlcuk',
  'm4r1a',
  'bridgenit',
  'bitchminer',
  'bisade',
  'boy666',
  'casually',
  'nayardu92',
  'djdarkstorm',
  'cristinaluchi',
  'dennis.spiedt',
  'sebtarnowski',
  'mihailm',
  'ardaia',
  'jemand',
  'chiefadu',
  'nikapelex',
];

/**
 * Membership check; defensive against case and surrounding whitespace
 * (legacy compared verbatim against path segments).
 */
export function isGdprUser(name: string): boolean {
  return gdprUserList.includes(name.trim().toLowerCase());
}

export default gdprUserList;
