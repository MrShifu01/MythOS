// mythos-install/questions.mjs
import prompts from 'prompts'
import chalk from 'chalk'

/**
 * Ask the 5 MythOS install questions.
 * @returns {Promise<{product: string, audience: string, speed: string, codeQuality: string, design: string}>}
 */
export async function askInstallQuestions() {
  console.log('')
  console.log(chalk.bold('  MythOS — 5 questions to configure your harness'))
  console.log(chalk.dim('  (Ctrl+C to cancel at any time)'))
  console.log('')

  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'product',
        message: 'What does your product do? (one sentence)',
        validate: v => v.trim().length > 0 || 'Required',
      },
      {
        type: 'text',
        name: 'audience',
        message: 'Who is it for?',
        validate: v => v.trim().length > 0 || 'Required',
      },
      {
        type: 'select',
        name: 'speed',
        message: 'Speed vs polish — how does your team work?',
        choices: [
          { title: 'Ship fast and fix — velocity first, iterate in production', value: 'fast' },
          { title: 'Balanced — ship regularly, quality matters but not perfectionism', value: 'balanced' },
          { title: 'Get it right first time — correctness and polish before shipping', value: 'right' },
        ],
        initial: 1,
      },
      {
        type: 'text',
        name: 'codeQuality',
        message: "What does \"good code\" mean here?\n  (e.g. strict TypeScript, ≥80% test coverage, no untested API endpoints)",
        validate: v => v.trim().length > 0 || 'Required',
      },
      {
        type: 'text',
        name: 'design',
        message: "What's the design language and aesthetic?\n  (e.g. minimal and fast, bold and expressive, utilitarian internal tool)",
        validate: v => v.trim().length > 0 || 'Required',
      },
    ],
    { onCancel: () => { console.log('\n  Cancelled.'); process.exit(0) } }
  )

  return answers
}

/**
 * Generate standards.md content from install answers.
 * Q3 (speed) adjusts the gate threshold and audit dimension weights.
 */
export function generateStandardsMd(answers) {
  const { product, audience, speed, codeQuality, design } = answers

  const gateThreshold = { fast: 70, balanced: 75, right: 80 }[speed]
  const speedLabel = {
    fast:     'Ship fast and fix — velocity over perfectionism. Release early, iterate often.',
    balanced: 'Balanced — ship regularly with quality. Avoid perfectionism but do not accumulate debt.',
    right:    'Get it right first time — correctness and polish before shipping.',
  }[speed]

  // Audit dimension weights — adjust based on speed preference
  const weights = speed === 'fast'
    ? { frontend: 10, backend: 20, database: 10, performance: 15, security: 25, testing: 5, api: 5, codeHealth: 10 }
    : speed === 'right'
    ? { frontend: 10, backend: 15, database: 10, performance: 10, security: 15, testing: 20, api: 5, codeHealth: 15 }
    : { frontend: 10, backend: 20, database: 10, performance: 10, security: 20, testing: 10, api: 5, codeHealth: 15 } // balanced

  // Verify weights sum to 100
  const sum = Object.values(weights).reduce((a, b) => a + b, 0)
  if (sum !== 100) throw new Error(`Audit weights must sum to 100, got ${sum}`)

  return `# Project Standards
**Generated:** ${new Date().toISOString().slice(0, 10)}

## Product
**What it does:** ${product}
**Who it's for:** ${audience}

## Quality Philosophy
${speedLabel}

## Code Standards
${codeQuality}

## Design Language
${design}

## Quality Gates
Deployment requires evaluation score ≥ **${gateThreshold}** (set by quality philosophy above).

Evaluation rubric: \`.mythos/context/evaluation-rubrics.md\`

## Audit Dimension Weights
Used by \`/mythos:audit\` to compute composite codebase health score.

| Dimension   | Weight |
|-------------|--------|
| Frontend    | ${weights.frontend}%     |
| Backend     | ${weights.backend}%     |
| Database    | ${weights.database}%     |
| Performance | ${weights.performance}%     |
| Security    | ${weights.security}%     |
| Testing     | ${weights.testing}%      |
| API         | ${weights.api}%      |
| Code health | ${weights.codeHealth}%     |

## Evolve Settings
- Max changes per \`/mythos:evolve\` pass: **5**
- Snapshot always saved before evolve
- Calibration examples are immutable ground truth — evolve never modifies them
`
}
