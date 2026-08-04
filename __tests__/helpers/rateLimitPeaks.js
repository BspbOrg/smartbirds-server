/* eslint-env node, jest */
const createPeakTracker = require('../../server/helpers/rateLimitPeaks')

// The tracker exists so the emitted percentile is over PER-IDENTITY peaks
// instead of a distribution blended across identities. Identity is a Map
// key only and is never passed to `emit` — these tests pin that contract.

describe('helpers/rateLimitPeaks', () => {
  const collect = (tracker) => {
    const out = []
    tracker.flush((tier, dimension, peak) => out.push({ tier, dimension, peak }))
    return out
  }

  test('keeps the MAX count per identity, not the last or the first', () => {
    const t = createPeakTracker({ maxIdentities: 10 })
    t.record('sensitive', 'user', 42, 5)
    t.record('sensitive', 'user', 42, 19)
    t.record('sensitive', 'user', 42, 7)
    expect(collect(t)).toEqual([{ tier: 'sensitive', dimension: 'user', peak: 19 }])
  })

  test('tracks identities, tiers and dimensions independently', () => {
    const t = createPeakTracker({ maxIdentities: 10 })
    t.record('sensitive', 'user', 1, 3)
    t.record('sensitive', 'user', 2, 8)
    t.record('sensitive', 'ip', 1, 4)
    t.record('default', 'user', 1, 9)
    const got = collect(t).sort((a, b) => a.peak - b.peak)
    expect(got).toEqual([
      { tier: 'sensitive', dimension: 'user', peak: 3 },
      { tier: 'sensitive', dimension: 'ip', peak: 4 },
      { tier: 'sensitive', dimension: 'user', peak: 8 },
      { tier: 'default', dimension: 'user', peak: 9 }
    ].sort((a, b) => a.peak - b.peak))
    expect(t.size).toBe(0) // flushed
  })

  test('never passes identity to emit (no PII in the metric path)', () => {
    const t = createPeakTracker({ maxIdentities: 10 })
    t.record('default', 'ip', '203.0.113.7', 2)
    const emit = jest.fn()
    t.flush(emit)
    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit.mock.calls[0]).toEqual(['default', 'ip', 2])
    expect(JSON.stringify(emit.mock.calls)).not.toContain('203.0.113.7')
  })

  test('flush CLEARS: a second flush with no new records emits nothing', () => {
    const t = createPeakTracker({ maxIdentities: 10 })
    t.record('default', 'ip', 'a', 3)
    expect(collect(t)).toHaveLength(1)
    expect(collect(t)).toHaveLength(0)
    expect(t.size).toBe(0)
  })

  test('at the cap: new identities are dropped but EXISTING ones keep updating', () => {
    // A flood of new identities must not evict the heavy users being measured.
    const t = createPeakTracker({ maxIdentities: 2 })
    t.record('default', 'ip', 'a', 1)
    t.record('default', 'ip', 'b', 1)
    t.record('default', 'ip', 'c', 99) // dropped — at cap, new key
    t.record('default', 'ip', 'a', 50) // existing key — must still update
    expect(t.size).toBe(2)
    const peaks = collect(t).map((e) => e.peak).sort((x, y) => x - y)
    expect(peaks).toEqual([1, 50])
  })

  test('reports the drop count via onDrop, then resets it', () => {
    const onDrop = jest.fn()
    const t = createPeakTracker({ maxIdentities: 1, onDrop })
    t.record('default', 'ip', 'a', 1)
    t.record('default', 'ip', 'b', 1)
    t.record('default', 'ip', 'c', 1)
    t.flush(() => {})
    expect(onDrop).toHaveBeenCalledWith(2)
    onDrop.mockClear()
    t.flush(() => {})
    expect(onDrop).not.toHaveBeenCalled() // reset, and not called with 0
  })

  test('ignores malformed input and never throws', () => {
    const t = createPeakTracker({ maxIdentities: 10 })
    expect(() => {
      t.record('default', 'ip', 'a', NaN)
      t.record('default', 'ip', 'a', Infinity)
      t.record('default', 'ip', 'a', -1)
      t.record('default', 'ip', 'a', '3')
      t.record('default', 'ip', null, 5)
      t.record('default', 'ip', undefined, 5)
      t.record('default', 'ip')
      t.record()
    }).not.toThrow()
    expect(t.size).toBe(0)
  })

  test('records a legitimate zero count', () => {
    // The first request in a window has a pre-record count of 0; that is data.
    const t = createPeakTracker({ maxIdentities: 10 })
    t.record('default', 'ip', 'a', 0)
    expect(collect(t)).toEqual([{ tier: 'default', dimension: 'ip', peak: 0 }])
  })

  test('an identity containing the separator cannot collide across dimensions', () => {
    const t = createPeakTracker({ maxIdentities: 10 })
    t.record('default', 'ip', 'x|y', 4)
    t.record('default', 'ip|x', 'y', 9)
    expect(t.size).toBe(2)
  })

  test('a flushed identity that goes idle contributes no sample', () => {
    const t = createPeakTracker({ maxIdentities: 10 })
    t.record('default', 'ip', 'a', 3)
    collect(t)
    t.record('default', 'ip', 'b', 6)
    expect(collect(t)).toEqual([{ tier: 'default', dimension: 'ip', peak: 6 }])
  })

  test('an emit callback that throws does not corrupt the tracker', () => {
    const t = createPeakTracker({ maxIdentities: 10 })
    t.record('default', 'ip', 'a', 3)
    expect(() => t.flush(() => { throw new Error('boom') })).not.toThrow()
    expect(t.size).toBe(0) // still cleared
  })
})
