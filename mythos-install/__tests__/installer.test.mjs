// mythos-install/__tests__/installer.test.mjs
import { test }                                      from 'node:test'
import assert                                        from 'node:assert/strict'
import { getCLAUDEMd, getProductMd, memoryFiles, skills } from '../templates.mjs'
import { generateStandardsMd }                       from '../questions.mjs'

// ─── templates.mjs ────────────────────────────────────────────────────────────

test('getCLAUDEMd returns ≤45-line CLAUDE.md with all 6 commands', () => {
  const md = getCLAUDEMd()
  const lines = md.trim().split('\n')
  assert.ok(lines.length <= 45, `Expected ≤45 lines, got ${lines.length}`)
  assert.ok(md.includes('/mythos:do'),       'missing /mythos:do')
  assert.ok(md.includes('/mythos:audit'),    'missing /mythos:audit')
  assert.ok(md.includes('/mythos:evolve'),   'missing /mythos:evolve')
  assert.ok(md.includes('/mythos:remember'), 'missing /mythos:remember')
  assert.ok(md.includes('/mythos:status'),   'missing /mythos:status')
  assert.ok(md.includes('/mythos:standards'),'missing /mythos:standards')
})

test('getCLAUDEMd contains outcome rule and 4 hard constraints', () => {
  const md = getCLAUDEMd()
  assert.ok(md.includes('No work begins without a scoreable outcome'), 'outcome rule missing')
  assert.ok(md.includes('No deploy without evaluation score'),         'deploy gate missing')
  assert.ok(md.includes('HIGH-tier actions'),                          'high-tier gate missing')
  assert.ok(md.includes('Save architectural decisions'),               'memory constraint missing')
})

test('getProductMd interpolates product and audience', () => {
  const md = getProductMd('A task manager', 'freelancers')
  assert.ok(md.includes('A task manager'), 'product missing')
  assert.ok(md.includes('freelancers'),    'audience missing')
})

test('memoryFiles contains all 6 expected files', () => {
  const expected = ['decisions.md', 'constraints.md', 'lessons.md', 'observations.md', 'hypotheses.md', 'audit-scores.md']
  for (const f of expected) {
    assert.ok(f in memoryFiles, `memoryFiles missing: ${f}`)
    assert.ok(memoryFiles[f].length > 0, `${f} is empty`)
  }
})

test('skills exports exactly 6 skills', () => {
  const skillNames = Object.keys(skills)
  assert.equal(skillNames.length, 6, `Expected 6 skills, got ${skillNames.length}: ${skillNames.join(', ')}`)
  for (const name of ['mythos-do', 'mythos-audit', 'mythos-evolve', 'mythos-remember', 'mythos-status', 'mythos-standards']) {
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
      content.includes('Output contract') || content.includes('output contract'),
      `${name}: missing Output contract section`
    )
  }
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
