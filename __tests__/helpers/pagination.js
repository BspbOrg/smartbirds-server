/* eslint-env node, jest */
const { clampLimit, resolveLimit, clampOffset } = require('../../server/helpers/pagination')

describe('helpers/pagination', () => {
  describe('clampLimit (floor-then-cap)', () => {
    test('caps values above max', () => expect(clampLimit(9999, 500)).toBe(500))
    test('passes a valid value through', () => expect(clampLimit(100, 500)).toBe(100))
    test('floors -1 up to 1', () => expect(clampLimit(-1, 500)).toBe(1))
    test('floors any negative up to 1', () => expect(clampLimit(-50, 500)).toBe(1))
    test('uses defaultLimit when absent', () => expect(clampLimit(undefined, 500, { defaultLimit: 50 })).toBe(50))
    test('uses defaultLimit for 0', () => expect(clampLimit(0, 500, { defaultLimit: 50 })).toBe(50))
    test('parses string input', () => expect(clampLimit('75', 500)).toBe(75))
    test('defaultLimit is still bounded by max', () => expect(clampLimit(undefined, 10, { defaultLimit: 50 })).toBe(10))
  })

  describe('resolveLimit (-1 means "all", bounded to max)', () => {
    test('maps -1 to max, never to 1 or unbounded', () => expect(resolveLimit(-1, 50000)).toBe(50000))
    test('maps any negative to max', () => expect(resolveLimit(-999, 1000)).toBe(1000))
    test('caps an oversized positive at max', () => expect(resolveLimit(999999, 1000)).toBe(1000))
    test('passes a valid value through', () => expect(resolveLimit(250, 1000)).toBe(250))
    test('absent falls back to defaultLimit', () => expect(resolveLimit(undefined, 1000)).toBe(20))
    test('0 falls back to defaultLimit', () => expect(resolveLimit(0, 1000, { defaultLimit: 20 })).toBe(20))
    test('non-numeric falls back to defaultLimit', () => expect(resolveLimit('abc', 1000)).toBe(20))
    test('parses string input', () => expect(resolveLimit('300', 1000)).toBe(300))
    test('never returns a negative or unbounded limit', () => {
      for (const v of [-1, -100, '-1', 0, 'x', undefined, null]) {
        const r = resolveLimit(v, 1000)
        expect(r).toBeGreaterThan(0)
        expect(r).toBeLessThanOrEqual(1000)
      }
    })
  })

  describe('clampOffset', () => {
    test('floors a negative offset to 0', () => expect(clampOffset(-5)).toBe(0))
    test('passes a valid offset through', () => expect(clampOffset(150)).toBe(150))
    test('absent becomes 0', () => expect(clampOffset(undefined)).toBe(0))
    test('parses string input', () => expect(clampOffset('20')).toBe(20))
  })
})
