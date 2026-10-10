require('@testing-library/jest-dom');
const { cleanup } = require('@testing-library/react');

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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