/* eslint-env node, jest */
const { boolEnv, intEnv, enumEnv } = require('../../server/helpers/envParse')

const NAME = 'RATE_LIMIT_TEST_VAR'
afterEach(() => { delete process.env[NAME] })
const set = (v) => { process.env[NAME] = v }

describe('helpers/envParse', () => {
  describe('boolEnv', () => {
    test('unset → default', () => expect(boolEnv(NAME, true)).toBe(true))
    test('empty → default', () => { set(''); expect(boolEnv(NAME, false)).toBe(false) })
    test.each(['true', '1', 'yes', 'on', 'TRUE', ' On '])('%s → true', (v) => { set(v); expect(boolEnv(NAME, false)).toBe(true) })
    test.each(['false', '0', 'no', 'off', 'OFF'])('%s → false', (v) => { set(v); expect(boolEnv(NAME, true)).toBe(false) })
    // The key fix: an unrecognised value must THROW, not silently flip on `def`.
    test('unknown value throws regardless of default', () => {
      set('maybe')
      expect(() => boolEnv(NAME, false)).toThrow(/RATE_LIMIT_TEST_VAR/)
      expect(() => boolEnv(NAME, true)).toThrow()
    })
  })

  describe('intEnv', () => {
    test('unset → default', () => expect(intEnv(NAME, 42)).toBe(42))
    test('parses a positive integer', () => { set('300'); expect(intEnv(NAME, 1)).toBe(300) })
    test('allows 0 (not swallowed as falsey)', () => { set('0'); expect(intEnv(NAME, 99)).toBe(0) })
    test('allows negatives', () => { set('-5'); expect(intEnv(NAME, 1)).toBe(-5) })
    test('trims whitespace', () => { set(' 12 '); expect(intEnv(NAME, 1)).toBe(12) })
    test('whitespace-only → default (not a throw)', () => { set('   '); expect(intEnv(NAME, 7)).toBe(7) })
    test.each(['abc', '3.5', '10x', 'NaN'])('non-integer %s throws', (v) => { set(v); expect(() => intEnv(NAME, 1)).toThrow(/RATE_LIMIT_TEST_VAR/) })
    // Bounds guard the limiter against silent-disable / self-DoS config.
    test('rejects a value below min', () => { set('0'); expect(() => intEnv(NAME, 5, { min: 1 })).toThrow(/>= 1/) })
    test('accepts a value at min', () => { set('1'); expect(intEnv(NAME, 5, { min: 1 })).toBe(1) })
    test('rejects a value above max', () => { set('10'); expect(() => intEnv(NAME, 5, { max: 9 })).toThrow(/<= 9/) })
  })

  describe('enumEnv', () => {
    const allowed = ['enforce', 'monitor']
    test('unset → default', () => expect(enumEnv(NAME, allowed, 'enforce')).toBe('enforce'))
    test('valid value (case-insensitive)', () => { set('MONITOR'); expect(enumEnv(NAME, allowed, 'enforce')).toBe('monitor') })
    test('invalid value throws', () => { set('audit'); expect(() => enumEnv(NAME, allowed, 'enforce')).toThrow(/enforce\/monitor/) })
  })
})
