#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInput(name) {
  return process.env[`INPUT_${name.replace(/-/g, '_').toUpperCase()}`] || '';
}

function setOutput(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (file) fs.appendFileSync(file, `${name}=${value}\n`);
}

function info(msg) { console.log(msg); }
function warn(msg) { console.log(`::warning::${msg}`); }
function fail(msg) { console.log(`::error::${msg}`); process.exitCode = 1; }

// ── Main ───────────────────────────────────────────────────────────────────────

async function run() {
  info('AI Regression Pattern Scan');
  info('');

  // Read inputs
  const severityThreshold = getInput('severity-threshold') || 'medium';
  const categories = getInput('categories') || 'security,correctness';
  const patternAgeDays = getInput('pattern-age-days') || '365';
  const failOnMatch = getInput('fail-on-match') === 'true';

  // Build detect command
  const args = ['detect', '--json'];
  if (severityThreshold) args.push('--severity', severityThreshold);
  if (categories) args.push('--categories', categories);
  if (patternAgeDays) args.push('--age', patternAgeDays);

  let matches = [];
  try {
    const cmd = `npx --yes @korext/regression-submit ${args.join(' ')}`;
    info(`Running: ${cmd}`);
    const output = execSync(cmd, { encoding: 'utf8', timeout: 120000 });
    const result = JSON.parse(output);
    matches = result.matches || [];
  } catch (e) {
    // detect may exit non-zero if patterns found
    try {
      const parsed = JSON.parse(e.stdout || '{}');
      matches = parsed.matches || [];
    } catch {
      info('No patterns matched or detection unavailable.');
    }
  }

  const matchCount = matches.length;
  const patternIds = matches.map(m => m.id || m.pattern_id).filter(Boolean);

  info(`Patterns matched: ${matchCount}`);
  if (matchCount > 0) {
    info('');
    matches.forEach(m => {
      const id = m.id || m.pattern_id || 'unknown';
      const file = m.file || '';
      const line = m.line || 0;
      const title = m.title || m.description || '';
      if (file && line) {
        console.log(`::warning file=${file},line=${line}::${id}: ${title}`);
      } else {
        warn(`${id}: ${title}`);
      }
    });
  }

  // Set outputs
  setOutput('matches-found', matchCount);
  setOutput('pattern-ids', patternIds.join(','));

  let status = 'PASS';
  if (matchCount > 0) {
    status = failOnMatch ? 'FAIL' : 'WARN';
  }
  setOutput('status', status);

  info('');
  info(`Result: ${status}`);

  if (failOnMatch && matchCount > 0) {
    fail(`${matchCount} regression pattern(s) detected. Failing build.`);
  }
}

run();
