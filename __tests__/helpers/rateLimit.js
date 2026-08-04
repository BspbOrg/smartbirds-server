/* eslint-env node, jest */
const { compileActionPatterns, resolveTier, buildKey } = require('../../server/helpers/rateLimit')

// Mirrors the shape of server/config/rateLimit.js actionPatterns.
const config = {
  actionPatterns: [
    { pattern: ':(list|export)$', tier: 'sensitive' }
  ]
}
const compiled = compileActionPatterns(config)

describe('helpers/rateLimit', () => {
  describe('resolveTier', () => {
    test('form list is sensitive', () => expect(resolveTier('formBears:list', compiled)).toBe('sensitive'))
    test('form export is sensitive', () => expect(resolveTier('formBears:export', compiled)).toBe('sensitive'))
    test('user:list is sensitive (covered by :(list|export)$)', () => expect(resolveTier('user:list', compiled)).toBe('sensitive'))
    test('downloader is default (per-image fetch, not the bulk tier)', () => expect(resolveTier('downloader', compiled)).toBe('default'))
    test('an unmatched action is default', () => expect(resolveTier('session:create', compiled)).toBe('default'))
    test('a view action is default', () => expect(resolveTier('formBears:view', compiled)).toBe('default'))
    test('a missing action name is default', () => expect(resolveTier(undefined, compiled)).toBe('default'))
    test('does not match list/export as a substring mid-name', () => expect(resolveTier('listings:create', compiled)).toBe('default'))
  })

  describe('compileActionPatterns', () => {
    test('produces one compiled matcher per pattern', () => {
      expect(compiled).toHaveLength(1)
      expect(compiled[0].re).toBeInstanceOf(RegExp)
      expect(compiled[0].tier).toBe('sensitive')
    })
    test('tolerates missing actionPatterns', () => expect(compileActionPatterns({})).toEqual([]))
  })

  describe('buildKey', () => {
    test('composes tier/dimension/id', () => expect(buildKey('sensitive', 'user', 123)).toBe('rl:sensitive:user:123'))
    test('composes an IP key', () => expect(buildKey('default', 'ip', '1.2.3.4')).toBe('rl:default:ip:1.2.3.4'))
  })
})
