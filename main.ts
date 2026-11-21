/**
 * NIGHTWATCH: Silent Wing - Competition Entry Packager
 *
 * Prepares the submission bundle by copying the offline game assets and
 * screenshots to the destination output directory, then generating the
 * canonical dossier.json specification for scoring.
 */

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Resolve repository root directory from module location (independent of cwd)
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

console.log(`Packaging NIGHTWATCH: Silent Wing entry to: ${outputDir}`);

// Ensure target directories exist
mkdirSync(outputDir, { recursive: true });
const targetGameDir = join(outputDir, 'game');
const targetScreenshotsDir = join(outputDir, 'screenshots');

mkdirSync(targetGameDir, { recursive: true });
mkdirSync(targetScreenshotsDir, { recursive: true });

// Copy static game distribution
const sourceGameDir = join(repoRoot, 'game');
cpSync(sourceGameDir, targetGameDir, { recursive: true });

// Copy promotional screenshots
const sourceScreenshotsDir = join(repoRoot, 'screenshots');
if (existsSync(sourceScreenshotsDir)) {
  cpSync(sourceScreenshotsDir, targetScreenshotsDir, { recursive: true });
}

// Generate canonical dossier for the make.fun grader
const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: {
    max: 4,
    max_bytes: 262144, // 256 KiB per screenshot
  },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

const dossierData = buildDossier(outputDir, dossierLimits);
writeFileSync(join(outputDir, 'dossier.json'), dossierData);

console.log(`Successfully generated dossier.json (${dossierData.length} bytes)`);
