#!/usr/bin/env node
/**
 * mythos-install — Install the MythOS AI harness into any repo.
 *
 * Usage (inside your repo root):
 *   npx mythos-install
 *
 * What it does:
 *   1. Asks 5 questions about your project
 *   2. Writes CLAUDE.md + .mythos/ skeleton
 *   3. Installs 6 MythOS skills globally (~/.claude/skills/)
 */

import { existsSync, writeFileSync, mkdirSync, readdirSync, readFileSync } from 'fs'
import { join, dirname }                                                    from 'path'
import { homedir }                                                          from 'os'
import { fileURLToPath }                                                    from 'url'
import chalk                                                                from 'chalk'
import { askInstallQuestions, generateStandardsMd }                         from './questions.mjs'
import { getCLAUDEMd, getProductMd, memoryFiles, skills,
         contextTreeDomains, getSessionEntry, getRelationsIndex }            from './templates.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cwd       = process.cwd()

// ─── Helpers ────────────────────────────────────────────────────────────────

function writeFile(relPath, content) {
  const abs = join(cwd, relPath)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content, 'utf8')
}

function writeGlobal(absPath, content) {
  mkdirSync(dirname(absPath), { recursive: true })
  writeFileSync(absPath, content, 'utf8')
}

function banner(text) {
  console.log('')
  console.log(chalk.bold('  ' + text))
}

function item(label, value) {
  console.log('  ' + chalk.green('✓') + ' ' + chalk.white(label) + (value ? chalk.dim(` — ${value}`) : ''))
}

// ─── Guards ─────────────────────────────────────────────────────────────────

if (!existsSync(join(cwd, 'package.json')) && !existsSync(join(cwd, 'CLAUDE.md'))) {
  console.log('')
  console.log(chalk.yellow('  ⚠  No package.json found in current directory.'))
  console.log(chalk.dim('     Run mythos-install from your project root.'))
  console.log(chalk.dim('     Continuing anyway — you can move files after install.'))
  console.log('')
}

// ─── Already installed? ─────────────────────────────────────────────────────

const alreadyInstalled = existsSync(join(cwd, '.mythos', 'context', 'standards.md'))
if (alreadyInstalled) {
  console.log('')
  console.log(chalk.yellow('  MythOS is already installed in this project.'))
  console.log(chalk.dim('  To re-configure, delete .mythos/context/standards.md and re-run.'))
  console.log(chalk.dim('  Skills will be re-installed regardless.'))
  console.log('')
}

// ─── Questions ──────────────────────────────────────────────────────────────

let answers = null
if (!alreadyInstalled) {
  answers = await askInstallQuestions()
}

// ─── Write .mythos/ structure ───────────────────────────────────────────────

banner('Writing .mythos/')

if (!alreadyInstalled && answers) {
  writeFile('CLAUDE.md', getCLAUDEMd())
  item('CLAUDE.md')

  writeFile('.mythos/context/product.md', getProductMd(answers.product, answers.audience))
  item('.mythos/context/product.md')

  writeFile('.mythos/context/standards.md', generateStandardsMd(answers))
  item('.mythos/context/standards.md')
}

// Copy evaluation-rubrics.md from package source
const sourceDir = join(__dirname, '..', 'source')

const rubricsSource = join(sourceDir, 'evaluation-rubrics.md')
if (existsSync(rubricsSource)) {
  writeFile('.mythos/context/evaluation-rubrics.md', readFileSync(rubricsSource, 'utf8'))
  item('.mythos/context/evaluation-rubrics.md')
}

// Copy evaluation-examples from package source
const examplesSource = join(sourceDir, 'evaluation-examples')
if (existsSync(examplesSource)) {
  for (const f of readdirSync(examplesSource)) {
    writeFile(`.mythos/context/evaluation-examples/${f}`, readFileSync(join(examplesSource, f), 'utf8'))
  }
  item('.mythos/context/evaluation-examples/', '6 calibration anchors')
}

// Write empty memory files (skip if already exist)
for (const [filename, content] of Object.entries(memoryFiles)) {
  const destPath = `.mythos/memory/${filename}`
  if (!existsSync(join(cwd, destPath))) {
    writeFile(destPath, content)
  }
}
item('.mythos/memory/', `${Object.keys(memoryFiles).length} files`)

// Empty scaffold dirs (legacy)
for (const dir of [
  '.mythos/memory/outcomes/skills',
  '.mythos/memory/outcomes/agents',
  '.mythos/memory/rules',
  '.mythos/sprints/active',
  '.mythos/sprints/archive',
  '.mythos/snapshots',
]) {
  mkdirSync(join(cwd, dir), { recursive: true })
}

// ─── Context Tree (ByteRover-inspired hierarchical knowledge structure) ──────

banner('Writing Context Tree → .mythos/memory/context-tree/')

const ctBase = '.mythos/memory/context-tree'

for (const [domain, config] of Object.entries(contextTreeDomains)) {
  // Create domain directory and context.md
  const domainPath = `${ctBase}/${domain}`
  const contextPath = `${domainPath}/context.md`
  if (!existsSync(join(cwd, contextPath))) {
    writeFile(contextPath, config['context.md'])
  }

  // Create topic subdirectories with their own context.md
  for (const topic of config.topics) {
    const topicDir = `${domainPath}/${topic}`
    mkdirSync(join(cwd, topicDir), { recursive: true })
    const topicContextPath = `${topicDir}/context.md`
    if (!existsSync(join(cwd, topicContextPath))) {
      writeFile(topicContextPath, `---\ntype: context-summary\ndomain: ${domain}\ntopic: ${topic}\nentry_count: 0\nlast_updated: ${new Date().toISOString()}\n---\n\n# ${domain}/${topic} — Summary\n\n_No entries yet._\n`)
    }
  }
}

// Write initial session entry
const sessionEntryPath = `${ctBase}/operations/session/current.md`
if (!existsSync(join(cwd, sessionEntryPath))) {
  writeFile(sessionEntryPath, getSessionEntry())
}

// Write empty relations index
const relIndexPath = `${ctBase}/.relations-index.json`
if (!existsSync(join(cwd, relIndexPath))) {
  writeFile(relIndexPath, getRelationsIndex())
}

item('.mythos/memory/context-tree/', `${Object.keys(contextTreeDomains).length} domains with Context Tree structure`)

// Copy ByteRover-inspired specs from package source
for (const specFile of ['context-tree.md', 'akl-spec.md', 'retrieval-spec.md', 'relations-spec.md', 'taste-spec.md']) {
  const specSource = join(sourceDir, specFile)
  if (existsSync(specSource)) {
    writeFile(`.mythos/context/${specFile}`, readFileSync(specSource, 'utf8'))
  }
}
item('.mythos/context/', '5 spec files (Context Tree, AKL, Retrieval, Relations, Taste)')

// Copy checklists from package source
const checklistsSource = join(sourceDir, 'checklists')
if (existsSync(checklistsSource)) {
  for (const f of readdirSync(checklistsSource)) {
    writeFile(`.mythos/checklists/${f}`, readFileSync(join(checklistsSource, f), 'utf8'))
  }
  item('.mythos/checklists/', '3 checklists')
}

// Copy rules README from package source
const rulesSource = join(sourceDir, 'rules', 'README.md')
if (existsSync(rulesSource)) {
  writeFile('.mythos/memory/rules/README.md', readFileSync(rulesSource, 'utf8'))
  item('.mythos/memory/rules/README.md')
}

// ─── Create global ~/.mythos/taste/ directory ────────────────────────────────

banner('Setting up global taste profile → ~/.mythos/taste/')

const globalMythosDir = join(homedir(), '.mythos', 'taste')
mkdirSync(globalMythosDir, { recursive: true })

const tasteFiles = {
  'profile.md': `---
version: 1
last_updated: ${new Date().toISOString()}
total_corrections: 0
total_accepted: 0
acceptance_rate: 0
projects_observed: 0
---

# Taste Profile

_No patterns learned yet. Run \`/mythos:taste\` after a few sessions to analyze your corrections._
`,
  'corrections.md': `---
total_entries: 0
last_entry: null
---

# Corrections Log

_Run \`/mythos:taste\` to populate this log by analyzing git diffs between Claude's output and your commits._
`,
  'stats.md': `---
last_updated: ${new Date().toISOString()}
---

# Acceptance Stats

## Overall
- Total files: 0
- Accepted: 0 (0%)
- Corrected: 0 (0%)
- Rejected: 0 (0%)

## By Category
_No data yet._

## By Project
_No data yet._

## Trend
_No data yet. Run \`/mythos:taste\` after working with Claude across a few sessions._
`,
}

for (const [filename, content] of Object.entries(tasteFiles)) {
  const tastePath = join(globalMythosDir, filename)
  if (!existsSync(tastePath)) {
    writeGlobal(tastePath, content)
  }
}
item('~/.mythos/taste/', '3 files (profile, corrections, stats)')

// ─── Install skills globally ─────────────────────────────────────────────────

banner('Installing skills → ~/.claude/skills/')

const skillsBase = join(homedir(), '.claude', 'skills')
for (const [skillName, skillContent] of Object.entries(skills)) {
  const skillDir = join(skillsBase, skillName)
  writeGlobal(join(skillDir, 'SKILL.md'), skillContent)
  item(`/${skillName.replace('mythos-', 'mythos:')}`, '~/.claude/skills/')
}

// ─── Install MCPs ─────────────────────────────────────────────────────────────

banner('Installing MCPs')

const MCPS = [
  {
    name: 'context7',
    description: 'live docs lookup — up-to-date library and API references',
    cmd: 'claude mcp add --transport http context7 https://mcp.context7.com/mcp',
  },
  {
    name: 'claude-peers',
    description: 'parallel execution + cross-session awareness',
    cmd: 'claude mcp add claude-peers npx @louislva/claude-peers-mcp',
  },
  {
    name: 'openspace',
    description: 'self-improving skill library',
    cmd: 'claude mcp add openspace npx openspace-mcp',
  },
]

// Check which MCPs are already installed
let installedMcps = ''
try {
  const { execSync } = await import('child_process')
  installedMcps = execSync('claude mcp list', { encoding: 'utf8', stdio: 'pipe' }).toLowerCase()
} catch { /* claude CLI not available — skip MCP install */ }

if (installedMcps !== '') {
  const { execSync } = await import('child_process')
  for (const mcp of MCPS) {
    if (installedMcps.includes(mcp.name.toLowerCase())) {
      console.log('  ' + chalk.dim('✓') + ' ' + chalk.dim(mcp.name + ' — already installed'))
    } else {
      try {
        execSync(mcp.cmd, { encoding: 'utf8', stdio: 'pipe' })
        item(mcp.name, mcp.description)
      } catch (e) {
        console.log('  ' + chalk.yellow('⚠') + ' ' + chalk.white(mcp.name) + chalk.dim(' — install failed (run manually: ' + mcp.cmd + ')'))
      }
    }
  }
} else {
  console.log(chalk.dim('  claude CLI not found — install MCPs manually:'))
  for (const mcp of MCPS) {
    console.log(chalk.dim('    ' + mcp.cmd))
  }
}

// ─── Done ─────────────────────────────────────────────────────────────────────

console.log('')
console.log(chalk.bold('  ▸ MythOS installed'))
console.log('  ' + '─'.repeat(38))
console.log('  ' + chalk.dim('standards.md    generated from your answers'))
console.log('  ' + chalk.dim('context-tree/   hierarchical knowledge structure (7 domains)'))
console.log('  ' + chalk.dim('skills          installed to ~/.claude/skills/'))
console.log('')
console.log('  Suggested first step:')
console.log('  ' + chalk.white('/mythos:audit') + chalk.dim(' — get your baseline codebase score'))
console.log('  ' + chalk.dim('                and generate your first sprints'))
console.log('')
console.log('  Then when ready:')
console.log('  ' + chalk.white('/mythos:do sprints'))
console.log('  ' + '─'.repeat(38))
console.log('')
