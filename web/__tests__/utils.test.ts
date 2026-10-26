import { describe, it, expect, beforeEach, vi } from 'vitest';
import { randomString } from '../src/utils/string.js';
import { tryParse, getItem, setItem } from '../src/utils/storage.js';
import { replaceUrlParameters } from '../src/utils/url.js';

describe('Web Utilities', () => {
  describe('randomString', () => {
    it('generates strings of the specified length', () => {
      const s1 = randomString(16);
      expect(s1).toHaveLength(16);

      const s2 = randomString(5, 'ABC');
      expect(s2).toHaveLength(5);
      expect(/^[ABC]+$/.test(s2)).toBe(true);
    });

    it('generates distinct random strings', () => {
      const a = randomString(32);
      const b = randomString(32);
      expect(a).not.toBe(b);
    });
  });

  describe('storage utils', () => {
    const memoryStore: Record<string, string> = {};

    beforeEach(() => {
      for (const k of Object.keys(memoryStore)) {
        delete memoryStore[k];
      }

      globalThis.localStorage = {
        getItem: vi.fn((key: string) => memoryStore[key] ?? null),
        setItem: vi.fn((key: string, val: string) => {
          memoryStore[key] = val;
        }),
        removeItem: vi.fn((key: string) => {
          delete memoryStore[key];
        }),
        clear: vi.fn(() => {
          for (const k of Object.keys(memoryStore)) delete memoryStore[k];
        }),
        length: 0,
        key: vi.fn(() => null),
      };
    });

    it('tryParse parses valid JSON and returns undefined for invalid JSON', () => {
      expect(tryParse('{"foo":"bar"}')).toEqual({ foo: 'bar' });
      expect(tryParse('[1,2,3]')).toEqual([1, 2, 3]);
      expect(tryParse('invalid json')).toBeUndefined();
    });

    it('getItem returns fallbackValue when key is missing or corrupted', () => {
      expect(getItem('nonexistent', 'fallback')).toBe('fallback');

      memoryStore['filedrop_corrupted'] = 'invalid { json';
      expect(getItem('corrupted', { def: 1 })).toEqual({ def: 1 });
    });

    it('setItem and getItem correctly store and retrieve values', () => {
      setItem('theme', { mode: 'dark' });
      expect(getItem('theme', { mode: 'light' })).toEqual({ mode: 'dark' });
    });

    it('setItem does not throw when localStorage throws (e.g. QuotaExceededError)', () => {
      globalThis.localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => setItem('overflow', 'test')).not.toThrow();
    });
  });

  describe('url utils', () => {
    beforeEach(() => {
      // Mock window.location
      (globalThis as any).window = {
        location: {
          hostname: 'example.com',
          protocol: 'https:',
          port: '',
        },
      };
    });

    it('replaces (hostname), (protocol), and (port) for HTTPS', () => {
      const url = 'turn:(hostname):(port)?transport=(protocol)';
      const replaced = replaceUrlParameters(url);
      expect(replaced).toBe('turn:example.com:443?transport=wss:');
    });

    it('replaces (hostname), (protocol), and (port) for HTTP with explicit port', () => {
      (globalThis as any).window.location = {
        hostname: 'localhost',
        protocol: 'http:',
        port: '5000',
      };

      const url = 'stun:(hostname):(port)';
      const replaced = replaceUrlParameters(url);
      expect(replaced).toBe('stun:localhost:5000');
    });
  });
});
