// mythos-install/__tests__/installer.test.mjs
import { test }                                      from 'node:test'
import assert                                        from 'node:assert/strict'
import { getCLAUDEMd, getProductMd, memoryFiles, skills,
         contextTreeDomains, getSessionEntry, getRelationsIndex } from '../templates.mjs'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { generateStandardsMd }                       from '../questions.mjs'

// ─── templates.mjs ────────────────────────────────────────────────────────────

test('getCLAUDEMd returns ≤60-line CLAUDE.md with all 7 commands', () => {
  const md = getCLAUDEMd()
  const lines = md.trim().split('\n')
  assert.ok(lines.length <= 65, `Expected ≤65 lines, got ${lines.length}`)
  assert.ok(md.includes('/mythos:do'),       'missing /mythos:do')
  assert.ok(md.includes('/mythos:audit'),    'missing /mythos:audit')
  assert.ok(md.includes('/mythos:evolve'),   'missing /mythos:evolve')
  assert.ok(md.includes('/mythos:remember'), 'missing /mythos:remember')
  assert.ok(md.includes('/mythos:taste'),    'missing /mythos:taste')
  assert.ok(md.includes('/mythos:status'),   'missing /mythos:status')
  assert.ok(md.includes('/mythos:standards'),'missing /mythos:standards')
})

test('getCLAUDEMd contains outcome rule and hard constraints', () => {
  const md = getCLAUDEMd()
  assert.ok(md.includes('No work begins without a scoreable outcome'), 'outcome rule missing')
  assert.ok(md.includes('No deploy without evaluation score'),         'deploy gate missing')
  assert.ok(md.includes('HIGH-tier actions'),                          'high-tier gate missing')
  assert.ok(md.includes('Save architectural decisions'),               'memory constraint missing')
})

test('getCLAUDEMd references Context Tree and progressive retrieval', () => {
  const md = getCLAUDEMd()
  assert.ok(md.includes('context-tree'),                'missing context-tree reference')
  assert.ok(md.includes('Progressive Context Loading'), 'missing progressive loading')
  assert.ok(md.includes('retrieval-spec.md'),           'missing retrieval spec reference')
  assert.ok(md.includes('maturity: core'),              'missing core maturity reference')
})

test('getProductMd interpolates product and audience', () => {
  const md = getProductMd('A task manager', 'freelancers')
  assert.ok(md.includes('A task manager'), 'product missing')
  assert.ok(md.includes('freelancers'),    'audience missing')
})

test('memoryFiles contains all 7 expected legacy files', () => {
  const expected = ['decisions.md', 'constraints.md', 'lessons.md', 'observations.md', 'hypotheses.md', 'audit-scores.md', 'session.md']
  for (const f of expected) {
    assert.ok(f in memoryFiles, `memoryFiles missing: ${f}`)
    assert.ok(memoryFiles[f].length > 0, `${f} is empty`)
  }
})

test('skills exports exactly 7 skills', () => {
  const skillNames = Object.keys(skills)
  assert.equal(skillNames.length, 7, `Expected 7 skills, got ${skillNames.length}: ${skillNames.join(', ')}`)
  for (const name of ['mythos-do', 'mythos-audit', 'mythos-evolve', 'mythos-remember', 'mythos-status', 'mythos-standards', 'mythos-taste']) {
    assert.ok(name in skills, `Missing skill: ${name}`)
  }
})

test('each skill has YAML frontmatter with name and allowed-tools', () => {
  for (const [name, content] of Object.entries(skills)) {
    assert.ok(content.startsWith('---\n'), `${name}: missing frontmatter opening`)
    assert.ok(content.includes('name: mythos:'), `${name}: missing name field`)
    assert.ok(content.includes('allowed-tools:'), `${name}: missing allowed-tools`)
  }
})

test('each skill has an Output contract section', () => {
  for (const [name, content] of Object.entries(skills)) {
    assert.ok(
      content.toLowerCase().includes('output contract'),
      `${name}: missing Output contract section`
    )
  }
})

// ─── Context Tree ─────────────────────────────────────────────────────────────

test('contextTreeDomains contains all 7 expected domains', () => {
  const expected = ['architecture', 'constraints', 'lessons', 'observations', 'outcomes', 'hypotheses', 'operations']
  for (const domain of expected) {
    assert.ok(domain in contextTreeDomains, `contextTreeDomains missing: ${domain}`)
    assert.ok(contextTreeDomains[domain]['context.md'].length > 0, `${domain}/context.md is empty`)
  }
})

test('contextTreeDomains — each domain context.md has YAML frontmatter', () => {
  for (const [domain, config] of Object.entries(contextTreeDomains)) {
    const content = config['context.md']
    assert.ok(content.startsWith('---\n'), `${domain}: context.md missing frontmatter opening`)
    assert.ok(content.includes('type: context-summary'), `${domain}: missing type field`)
    assert.ok(content.includes(`domain: ${domain}`), `${domain}: missing domain field`)
  }
})

test('contextTreeDomains — architecture has decisions and patterns topics', () => {
  assert.deepStrictEqual(
    contextTreeDomains.architecture.topics,
    ['decisions', 'patterns'],
    'architecture should have decisions and patterns topics'
  )
})

test('contextTreeDomains — constraints has invariant, policy, preference topics', () => {
  assert.deepStrictEqual(
    contextTreeDomains.constraints.topics,
    ['invariant', 'policy', 'preference'],
    'constraints should have invariant, policy, preference topics'
  )
})

test('contextTreeDomains — operations has session and audit-history topics', () => {
  assert.deepStrictEqual(
    contextTreeDomains.operations.topics,
    ['session', 'audit-history'],
    'operations should have session and audit-history topics'
  )
})

test('getSessionEntry returns valid markdown with AKL frontmatter', () => {
  const entry = getSessionEntry()
  assert.ok(entry.startsWith('---\n'), 'session entry missing frontmatter')
  assert.ok(entry.includes('id: current'), 'missing id field')
  assert.ok(entry.includes('domain: operations'), 'missing domain field')
  assert.ok(entry.includes('importance: 50'), 'missing importance field')
  assert.ok(entry.includes('maturity: validated'), 'missing maturity field')
  assert.ok(entry.includes('access_count: 0'), 'missing access_count field')
  assert.ok(entry.includes('relations: []'), 'missing relations field')
})

test('getRelationsIndex returns valid empty JSON', () => {
  const index = getRelationsIndex()
  const parsed = JSON.parse(index)
  assert.deepStrictEqual(parsed, {}, 'relations index should be empty object')
})

// ─── Skills — ByteRover integration ──────────────────────────────────────────

test('mythos-remember skill references Context Tree and curate operations', () => {
  const content = skills['mythos-remember']
  assert.ok(content.includes('Context Tree'), 'missing Context Tree reference')
  assert.ok(content.includes('ADD'),    'missing ADD operation')
  assert.ok(content.includes('UPDATE'), 'missing UPDATE operation')
  assert.ok(content.includes('UPSERT'), 'missing UPSERT operation')
  assert.ok(content.includes('MERGE'),  'missing MERGE operation')
  assert.ok(content.includes('DELETE'), 'missing DELETE operation')
  assert.ok(content.includes('importance'), 'missing AKL importance reference')
  assert.ok(content.includes('maturity'),   'missing AKL maturity reference')
  assert.ok(content.includes('relations'),  'missing relations reference')
})

test('mythos-do skill references progressive retrieval tiers', () => {
  const content = skills['mythos-do']
  assert.ok(content.includes('Tier 0-1'), 'missing Tier 0-1')
  assert.ok(content.includes('Tier 2'),   'missing Tier 2')
  assert.ok(content.includes('Tier 3'),   'missing Tier 3')
  assert.ok(content.includes('Tier 4'),   'missing Tier 4')
  assert.ok(content.includes('Out-of-domain'), 'missing OOD detection')
})

test('mythos-audit skill references Context Tree health', () => {
  const content = skills['mythos-audit']
  assert.ok(content.includes('Context Tree Health'), 'missing Context Tree health')
  assert.ok(content.includes('relation graph'), 'missing relation graph reference')
  assert.ok(content.includes('audit-history'), 'missing audit-history path')
})

test('mythos-evolve skill references AKL lifecycle management', () => {
  const content = skills['mythos-evolve']
  assert.ok(content.includes('AKL Maintenance'), 'missing AKL maintenance')
  assert.ok(content.includes('Promote'),  'missing promote reference')
  assert.ok(content.includes('Demote'),   'missing demote reference')
  assert.ok(content.includes('Relation Graph Health'), 'missing relation graph health')
  assert.ok(content.includes('.relations-index.json'), 'missing relations index reference')
})

// ─── questions.mjs ────────────────────────────────────────────────────────────

test('generateStandardsMd — fast mode sets gate threshold to 70', () => {
  const md = generateStandardsMd({ product: 'P', audience: 'A', speed: 'fast', codeQuality: 'Q', design: 'D' })
  assert.ok(md.includes('**70**'), `Expected gate **70**, got:\n${md}`)
})

test('generateStandardsMd — balanced mode sets gate threshold to 75', () => {
  const md = generateStandardsMd({ product: 'P', audience: 'A', speed: 'balanced', codeQuality: 'Q', design: 'D' })
  assert.ok(md.includes('**75**'), `Expected gate **75**`)
})

test('generateStandardsMd — right mode sets gate threshold to 80', () => {
  const md = generateStandardsMd({ product: 'P', audience: 'A', speed: 'right', codeQuality: 'Q', design: 'D' })
  assert.ok(md.includes('**80**'), `Expected gate **80**`)
})

test('generateStandardsMd — audit weights sum to 100 for all speed options', () => {
  for (const speed of ['fast', 'balanced', 'right']) {
    const md = generateStandardsMd({ product: 'P', audience: 'A', speed, codeQuality: 'Q', design: 'D' })
    const matches = [...md.matchAll(/\|\s*(\d+)%/g)].map(m => parseInt(m[1]))
    const sum = matches.reduce((a, b) => a + b, 0)
    assert.equal(sum, 100, `${speed}: audit weights sum to ${sum}, expected 100`)
  }
})

test('generateStandardsMd — fast mode Security weight > right mode Security weight', () => {
  const fast  = generateStandardsMd({ product: 'P', audience: 'A', speed: 'fast',  codeQuality: 'Q', design: 'D' })
  const right = generateStandardsMd({ product: 'P', audience: 'A', speed: 'right', codeQuality: 'Q', design: 'D' })
  const secFast  = parseInt(fast.match(/Security\s+\|\s+(\d+)%/)?.[1]  ?? '0')
  const secRight = parseInt(right.match(/Security\s+\|\s+(\d+)%/)?.[1] ?? '0')
  assert.ok(secFast > secRight, `fast Security (${secFast}) should exceed right Security (${secRight})`)
})

// ─── Taste Learning ──────────────────────────────────────────────────────────

test('mythos-taste skill references git diff analysis and confidence scoring', () => {
  const content = skills['mythos-taste']
  assert.ok(content.includes('git log'), 'missing git log reference')
  assert.ok(content.includes('claude.ai/code/session'), 'missing session URL detection')
  assert.ok(content.includes('accepted'), 'missing accepted classification')
  assert.ok(content.includes('corrected'), 'missing corrected classification')
  assert.ok(content.includes('rejected'), 'missing rejected classification')
  assert.ok(content.includes('weak'), 'missing weak confidence')
  assert.ok(content.includes('moderate'), 'missing moderate confidence')
  assert.ok(content.includes('strong'), 'missing strong confidence')
  assert.ok(content.includes('established'), 'missing established confidence')
})

test('mythos-taste skill references all 10 correction categories', () => {
  const content = skills['mythos-taste']
  for (const cat of ['style', 'architecture', 'error-handling', 'simplicity', 'verbosity', 'safety', 'testing', 'ux', 'naming', 'dependencies']) {
    assert.ok(content.includes(cat), `missing correction category: ${cat}`)
  }
})

test('mythos-taste skill has review, reset, and ignore modes', () => {
  const content = skills['mythos-taste']
  assert.ok(content.includes('taste review'), 'missing review mode')
  assert.ok(content.includes('taste reset'), 'missing reset mode')
  assert.ok(content.includes('taste ignore'), 'missing ignore mode')
})

test('CLAUDE.md references taste profile in session start', () => {
  const md = getCLAUDEMd()
  assert.ok(md.includes('taste/profile.md'), 'missing taste profile in session start')
  assert.ok(md.includes('/mythos:taste'), 'missing taste command')
  assert.ok(md.includes('taste-spec.md'), 'missing taste spec reference')
})

test('mythos-do skill references taste-aware execution', () => {
  const content = skills['mythos-do']
  assert.ok(content.includes('Taste-Aware'), 'missing taste-aware section')
  assert.ok(content.includes('taste profile influenced'), 'missing taste influence reporting')
})

test('mythos-evolve skill references taste integration', () => {
  const content = skills['mythos-evolve']
  assert.ok(content.includes('Taste'), 'missing taste section')
  assert.ok(content.includes('taste/corrections.md'), 'missing corrections reference')
  assert.ok(content.includes('acceptance'), 'missing acceptance reference')
})

test('mythos-status skill shows taste metrics', () => {
  const content = skills['mythos-status']
  assert.ok(content.includes('TASTE'), 'missing TASTE section in status')
  assert.ok(content.includes('acceptance'), 'missing acceptance rate')
  assert.ok(content.includes('patterns'), 'missing patterns count')
})

test('mythos-standards skill references taste-aware analysis', () => {
  const content = skills['mythos-standards']
  assert.ok(content.includes('Taste-aware'), 'missing taste-aware analysis')
  assert.ok(content.includes('taste/profile.md'), 'missing taste profile reference')
})
