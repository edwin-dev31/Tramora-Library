class TextEncoderPolyfill {
  encode(input) {
    if (typeof input === 'string') {
      const result = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) {
        result[i] = input.charCodeAt(i);
      }
      return result;
    }
    return new Uint8Array(0);
  }
}

global.TextEncoder = TextEncoderPolyfill;
global.TextDecoder = require('util').TextDecoder;