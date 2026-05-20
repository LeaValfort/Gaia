/**
 * Déploie la prod sur les deux projets Vercel (gaia + gaia-e3iu).
 * Usage : npm run deploy:prod
 */
import { execSync } from 'node:child_process'

const PROJECTS = ['gaia', 'gaia-e3iu']

for (const project of PROJECTS) {
  console.log(`\n——— ${project} ———`)
  execSync(`npx vercel link --project ${project} --yes`, { stdio: 'inherit' })
  execSync('npx vercel deploy --prod --yes', { stdio: 'inherit' })
}

console.log('\n✓ Prod déployée sur gaia-virid-alpha et gaia-e3iu')
