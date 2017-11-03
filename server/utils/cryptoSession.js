'use strict'

const sodium = require('libsodium-wrappers')
const session = require('koa-session')

module.exports = function(app, opts) {
  opts = opts || {}

  if (opts.signed === undefined) {
    opts.signed = true
  }

  let secret;
  try {
    secret = new Buffer(opts.crypto_key, 'base64')
    if (secret.length !== sodium.crypto_secretbox_KEYBYTES)
    throw new Error(`Crypto key should decode to ${sodium.crypto_secretbox_KEYBYTES} bytes in length`)
  }
  catch(error) {
    throw new Error('Missing or invalid options.crypto_key', error)
  }

  opts.encode = encode
  opts.decode = decode

  app.use(session(app, opts))

  function encode(body) {
    try {
      body = JSON.stringify(body)
      const plainbuf = new Buffer(body)
      const cipherbuf = encrypt(plainbuf, secret)
      return `crypto-session:${cipherbuf.toString('base64')}`
    }
    catch(err) {
      console.error('Crypto-session: encode error resetting session', body, err, (err ? err.stack : undefined));
      return encrypt(new Buffer('').toString('base64'), secret);
    }
  }

  function decode(text) {
    try {
      if (!/^crypto-session:/.test(text))
        throw 'Unrecognized encrypted session format.'

      text = text.substring('crypto-session:'.length)
      const buf = new Buffer(text, 'base64')
      const body = decrypt(buf, secret).toString('utf8')
      const json = JSON.parse(body)

      // check if the cookie is expired
      if (!json._expire) return null
      if (json._expire < Date.now()) return null

      return json
    }
    catch(err) {
      console.log(err)
      try {
        const jsonString = new Buffer(text, 'base64').toString('utf8')
        JSON.parse(jsonString)
        // Already JSON
        console.log('Crypto-session: Encrypting plaintext session.', jsonString)
        return text
      }
      catch(error2) {// debug('decode %j error: %s', json, err);
        // throw new Error('Crypto-session: Discarding session: ' + text)
        console.error('Crypto-session: Discarding session', text, error2);
        return {};
      }
      console.error('Crypto-session: decode error resetting session', text, err, (err ? err.stack : undefined));
      return {};
    }
  }
}

/** 
 * @arg {Buffer} buf
 * @return {Buffer}
*/
function encrypt(buf, secret) {
  const nonce = Buffer.from(sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES))
  const ciphertext = sodium.crypto_secretbox_easy(buf, nonce, secret)
  return Buffer.concat([nonce, Buffer.from(ciphertext)])
}

/**
 * @arg {Buffer} buf
 * @return Buffer
*/
function decrypt(buf, secret) {
  const nonce = buf.slice(0, sodium.crypto_box_NONCEBYTES);
  const cipherbuf = buf.slice(sodium.crypto_box_NONCEBYTES);
  return sodium.crypto_secretbox_open_easy(cipherbuf, nonce, secret, 'text');
}
