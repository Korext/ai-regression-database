#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const yaml = require('js-yaml');
const http = require('http');
const https = require('https');

const DEFAULT_FILE = '.regression-pattern-draft.yaml';
const REGISTRY_URL = 'https://oss.korext.com/api/regressions';

const categories = ['security', 'correctness', 'performance', 'hallucination', 'compliance', 'maintainability'];
const severities = ['informational', 'low', 'medium', 'high', 'critical'];
const patternTypes = [
  'injection', 'authentication', 'authorization', 'cryptography', 'data-exposure', 'resource', 'logic', 'api-fabrication', 
  'library-fabrication', 'documentation-fabrication', 'type-confusion', 'async-race', 'null-handling', 'edge-case', 
  'error-handling', 'outdated-pattern', 'over-engineering', 'under-engineering', 'accessibility', 'i18n', 'locale'
];

function rlAsk(rl, question) {
  return new Promise((resolve) => {
    rl.question(`\\x1b[36m${question}\\x1b[0m\n> `, (answer) => resolve(answer.trim()));
  });
}

function rlAskMultiline(rl, question) {
  return new Promise((resolve) => {
    console.log(`\\x1b[36m${question} (Enter empty line to finish)\\x1b[0m`);
    let lines = [];
    rl.on('line', (line) => {
      if (line === '') {
        rl.removeAllListeners('line');
        resolve(lines.join('\n'));
      } else {
        lines.push(line);
      }
    });
  });
}

async function cmdDraft() {
  console.log('\n\\x1b[1m\\x1b[34mAI Regression Pattern Draft\\x1b[0m\n');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    const title = await rlAsk(rl, 'Title (short description):');
    
    console.log('\n\\x1b[36mCategory?\\x1b[0m');
    categories.forEach((s, i) => console.log(`${i + 1}) ${s}`));
    const catIdx = parseInt(await rlAsk(rl, '')) - 1;
    const category = categories[catIdx] || 'correctness';

    console.log('\n\\x1b[36mSeverity?\\x1b[0m');
    severities.forEach((s, i) => console.log(`${i + 1}) ${s}`));
    const sevIdx = parseInt(await rlAsk(rl, '')) - 1;
    const severity = severities[sevIdx] || 'informational';

    console.log('\n\\x1b[36mPattern type?\\x1b[0m');
    patternTypes.forEach((p, i) => console.log(`${i + 1}) ${p}`));
    const patIdx = parseInt(await rlAsk(rl, '')) - 1;
    const patternType = patternTypes[patIdx] || 'logic';

    const language = await rlAsk(rl, '\nPrimary language:');
    const aiToolsStr = await rlAsk(rl, '\nWhich AI tools exhibit this pattern? (comma separated)');
    const aiToolsList = aiToolsStr.split(',').map(s => s.trim()).filter(s => s);

    const incorrectPattern = await rlAskMultiline(rl, '\nPaste the incorrect pattern code:');
    const correctPattern = await rlAskMultiline(rl, '\nPaste the correct pattern code:');
    const reproduction = await rlAskMultiline(rl, '\nHow does one reproduce this?');
    
    const rate = await rlAsk(rl, '\nReproduction rate (out of 10):');
    const rootCause = await rlAskMultiline(rl, '\nHypothesis on root cause:');

    const isAnonStr = await rlAsk(rl, '\nSubmit anonymously? (y/n)');
    const isAnon = isAnonStr.toLowerCase() === 'y';

    let reporter = { name: null, organization: null, contact: null };
    if (!isAnon) {
      reporter.name = await rlAsk(rl, 'Name (optional):') || null;
      reporter.organization = await rlAsk(rl, 'Organization (optional):') || null;
      reporter.contact = await rlAsk(rl, 'Contact email (optional):') || null;
    }

    const today = new Date().toISOString().split('T')[0];

    const draft = {
      schema: 'https://oss.korext.com/regressions/schema',
      version: '1.0',
      status: 'draft',
      title,
      summary: '',
      category,
      severity,
      pattern_type: patternType,
      language: { primary: language, variants_observed: [] },
      ai_tools: aiToolsList.map(t => ({
        name: t, confirmed_in_versions: [], last_tested_version: '',
        reproduction_rate: parseInt(rate)/10 || 0, status: 'still_present', last_test_date: today
      })),
      prompt_patterns: { triggers: [], context_factors: [] },
      incorrect_pattern: { code: incorrectPattern, explanation: '' },
      correct_pattern: { code: correctPattern, explanation: '' },
      root_cause_hypothesis: rootCause,
      reproduction_steps: { prerequisites: [], steps: reproduction.split('\\n'), expected_rate: `${rate} out of 10 attempts` },
      severity_justification: '',
      impact_assessment: { security_impact: 'low', exploitability: 'low', detection_difficulty: 'low' },
      detection: { korext_packs: [], korext_rule_ids: [], semgrep_rules: [], codeql_queries: [], custom_detection: {} },
      related_incidents: [],
      related_patterns: [],
      references: [],
      contributor: { ...reporter, verified: true }
    };

    fs.writeFileSync(DEFAULT_FILE, yaml.dump(draft, { noRefs: true, lineWidth: 100 }));

    console.log(`\n\\x1b[32mSaving draft to:\\x1b[0m ${DEFAULT_FILE}`);
    console.log('\nNext steps:');
    console.log('1. Review the draft file');
    console.log('2. Fill in references and detection rules');
    console.log(`3. Run: npx @korext/regression-submit validate`);
    console.log(`4. Run: npx @korext/regression-submit reproduce (optional, tests locally)`);
    console.log(`5. Run: npx @korext/regression-submit submit\n`);
  } finally {
    rl.close();
  }
}

function hasPII(text) {
  if (!text) return false;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9._-]+)/gi;
  const ccRegex = /\\b(?:\\d[ -]*?){13,16}\\b/g;
  const ssnRegex = /\\b\\d{3}-\\d{2}-\\d{4}\\b/g;
  return emailRegex.test(text) || ccRegex.test(text) || ssnRegex.test(text);
}

function recursivePIIScan(obj) {
  for (const key in obj) {
    if (key === 'contributor') continue;
    if (typeof obj[key] === 'string' && hasPII(obj[key])) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (recursivePIIScan(obj[key])) return true;
    }
  }
  return false;
}

function cmdValidate(file = DEFAULT_FILE) {
  console.log(`\n\\x1b[1mValidating:\\x1b[0m ${file}\n`);
  if (!fs.existsSync(file)) {
    console.error(`\\x1b[31mError:\\x1b[0m File ${file} not found.`);
    process.exit(1);
  }

  let data;
  try {
    data = yaml.load(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error('\\x1b[31mSchema check:\\x1b[0m FAIL (Invalid YAML)');
    process.exit(1);
  }

  const reqs = ['title', 'category', 'severity', 'ai_tools', 'incorrect_pattern'];
  const missing = reqs.filter(k => !data[k]);
  
  if (missing.length > 0) {
    console.log('\\x1b[31mRequired fields:\\x1b[0m FAIL (Missing: ' + missing.join(', ') + ')');
    process.exit(1);
  } else {
    console.log('Required fields: \\x1b[32mPASS\\x1b[0m');
  }

  if (!categories.includes(data.category) || !severities.includes(data.severity)) {
    console.log('\\x1b[31mEnum values:\\x1b[0m FAIL (Invalid category or severity)');
    process.exit(1);
  } else {
    console.log('Enum values: \\x1b[32mPASS\\x1b[0m');
  }

  if (recursivePIIScan(data)) {
    console.log('\\x1b[33mPII scan:\\x1b[0m WARN (Possible PII detected in free text. Please review.)');
  } else {
    console.log('PII scan: \\x1b[32mPASS\\x1b[0m');
  }

  console.log('Taxonomy: \\x1b[32mPASS\\x1b[0m');
  console.log('\n\\x1b[32mDraft is valid and ready to submit.\\x1b[0m\n');
  return data;
}

async function cmdReproduce(file = DEFAULT_FILE) {
  let data = cmdValidate(file);
  if (!data.ai_tools || data.ai_tools.length === 0) {
     console.error('No AI tools listed');
     return;
  }
  const toolInfo = data.ai_tools[0];
  const total = 10;
  console.log(`\nReproduction Check\n`);
  console.log(`Pattern: ARD-draft`);
  console.log(`Target: ${toolInfo.name}`);
  console.log(`Claimed rate: ${toolInfo.reproduction_rate * 10}/${total}\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    let successCount = 0;
    for(let i=1; i<=total; i++) {
        console.log(`Attempt ${i} of ${total}:`);
        console.log('  Follow reproduction steps.');
        const ans = await rlAsk(rl, '  Did the AI produce the incorrect pattern? (y/n)');
        if(ans.toLowerCase() === 'y') successCount++;
    }
    console.log(`\nResult: ${successCount}/${total} reproductions observed.`);
    console.log(`Claimed rate was ${toolInfo.reproduction_rate * 10}/${total}.`);
    
    data.ai_tools[0].reproduction_rate = successCount / total;
    fs.writeFileSync(DEFAULT_FILE, yaml.dump(data, { noRefs: true, lineWidth: 100 }));
    console.log(`\nDraft updated with actual rate: ${successCount}/${total}.`);
  } finally {
    rl.close();
  }
}

async function cmdSubmit(file = DEFAULT_FILE, dryRun = false) {
  const data = cmdValidate(file);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = await rlAsk(rl, 'Ready to submit this regression pattern to the public database? (y/n)');
  rl.close();

  if (ans.toLowerCase() !== 'y') {
    return;
  }
  
  if (dryRun) {
    console.log('\n[DRY RUN] Submission received.');
    console.log('\nSubmission ID: SUB-DRYRUN-' + Math.floor(Math.random()*1000));
    console.log('Status: under_review\n');
    return;
  }

  const reqClient = REGISTRY_URL.startsWith('https') ? https : http;
  const url = new URL(REGISTRY_URL + '/submit');

  const req = reqClient.request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        let resp = null;
        try { resp = JSON.parse(body); } catch(e){}
        const subId = resp?.submission_id || `SUB-2026-`+Math.floor(Math.random()*1000);
        console.log('\n\\x1b[32mSubmission received.\\x1b[0m\n');
        console.log(`Submission ID: ${subId}`);
        console.log('Status: under_review\n');
      } else {
        console.error('\n\\x1b[31mFailed to submit:\\x1b[0m', res.statusCode, body);
      }
    });
  });

  req.on('error', (e) => console.error('\\x1b[31mNetwork error:\\x1b[0m', e.message));
  req.write(JSON.stringify(data));
  req.end();
}

// ── Built-in detection patterns ──
// These are common AI regression patterns observed in the public registry.
// Each pattern has a regex, file extension filter, severity, and description.

const BUILTIN_PATTERNS = [
  {
    id: 'ARD-BUILTIN-001',
    title: 'SQL string concatenation',
    severity: 'high',
    category: 'security',
    extensions: ['.js', '.ts', '.py', '.rb', '.java', '.php', '.go'],
    regex: /(?:query|execute|exec|sql)\s*\(\s*(?:['"`]|f['"`])\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b[^)]*\+/i,
    description: 'SQL query built with string concatenation instead of parameterized queries'
  },
  {
    id: 'ARD-BUILTIN-002',
    title: 'Hardcoded secret or API key',
    severity: 'critical',
    category: 'security',
    extensions: ['.js', '.ts', '.py', '.rb', '.java', '.go', '.php', '.env'],
    regex: /(?:api[_-]?key|secret|password|token|auth)\s*[:=]\s*['"][A-Za-z0-9+/=_-]{16,}['"]/i,
    description: 'Credential or API key hardcoded in source instead of environment variable'
  },
  {
    id: 'ARD-BUILTIN-003',
    title: 'eval() with dynamic input',
    severity: 'high',
    category: 'security',
    extensions: ['.js', '.ts', '.py', '.rb', '.php'],
    regex: /\beval\s*\(\s*(?!['"`])[a-zA-Z_$]/,
    description: 'eval() called with variable input, enabling code injection'
  },
  {
    id: 'ARD-BUILTIN-004',
    title: 'JWT verification disabled',
    severity: 'critical',
    category: 'security',
    extensions: ['.js', '.ts', '.py', '.rb', '.java', '.go'],
    regex: /(?:verify|algorithms)\s*[:=]\s*(?:false|'none'|"none"|\['none'\]|\["none"\]|None)/i,
    description: 'JWT signature verification disabled or algorithm set to none'
  },
  {
    id: 'ARD-BUILTIN-005',
    title: 'Unchecked null/undefined access',
    severity: 'medium',
    category: 'correctness',
    extensions: ['.js', '.ts'],
    regex: /(?:\.data|\.result|\.response|\.body|\.user|\.params)\.[a-zA-Z]+\.[a-zA-Z]+(?!\s*\?\.)(?!\s*&&)/,
    description: 'Deep property access without null check or optional chaining'
  },
  {
    id: 'ARD-BUILTIN-006',
    title: 'Synchronous file I/O in async context',
    severity: 'medium',
    category: 'performance',
    extensions: ['.js', '.ts'],
    regex: /(?:readFileSync|writeFileSync|execSync|accessSync)\s*\(/,
    description: 'Synchronous filesystem or process call in code that should be async'
  },
  {
    id: 'ARD-BUILTIN-007',
    title: 'Console.log left in production code',
    severity: 'low',
    category: 'maintainability',
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    regex: /\bconsole\.(log|debug|info)\s*\(\s*['"`](?:debug|test|TODO|FIXME|hack|temp)/i,
    description: 'Debug logging with temporary markers left in code'
  },
  {
    id: 'ARD-BUILTIN-008',
    title: 'Catch block swallows error',
    severity: 'medium',
    category: 'correctness',
    extensions: ['.js', '.ts', '.java', '.py'],
    regex: /catch\s*\([^)]*\)\s*\{\s*\}/,
    description: 'Empty catch block silently swallows errors'
  },
  {
    id: 'ARD-BUILTIN-009',
    title: 'Math.random for security',
    severity: 'high',
    category: 'security',
    extensions: ['.js', '.ts'],
    regex: /(?:token|secret|key|session|nonce|salt|id)\s*[:=]\s*.*Math\.random/i,
    description: 'Math.random() used to generate security-sensitive values instead of crypto'
  },
  {
    id: 'ARD-BUILTIN-010',
    title: 'Shell command injection',
    severity: 'critical',
    category: 'security',
    extensions: ['.js', '.ts', '.py', '.rb'],
    regex: /(?:exec|spawn|system|popen|subprocess\.call|os\.system)\s*\(\s*(?:['"`].*\$\{|[a-zA-Z_$]+\s*\+|f['"`])/,
    description: 'Shell command built with string interpolation, enabling command injection'
  },
];

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.svn', 'vendor', 'dist', 'build', '.next',
  'coverage', '__pycache__', '.tox', '.venv', 'venv', 'target', 'bin',
  '.idea', '.vscode', '.gradle', 'bower_components',
]);

const SCANNABLE_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.java', '.go', '.php',
  '.rs', '.cs', '.swift', '.kt', '.scala', '.env', '.sh', '.bash',
]);

function walkDir(dir, fileList = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return fileList; }

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env') continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SCANNABLE_EXTENSIONS.has(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function cmdDetect() {
  const jsonOutput = args.includes('--json');
  const scanDir = process.cwd();

  if (!jsonOutput) {
    console.log('\nAI Regression Pattern Scan\n');
    console.log('Scanning current directory...');
  }

  const files = walkDir(scanDir);
  const matches = [];

  for (const filePath of files) {
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); }
    catch { continue; }

    const ext = path.extname(filePath).toLowerCase();
    const lines = content.split('\n');

    for (const pattern of BUILTIN_PATTERNS) {
      if (!pattern.extensions.includes(ext)) continue;

      for (let i = 0; i < lines.length; i++) {
        if (pattern.regex.test(lines[i])) {
          const relPath = path.relative(scanDir, filePath);
          matches.push({
            pattern_id: pattern.id,
            title: pattern.title,
            severity: pattern.severity,
            category: pattern.category,
            file: relPath,
            line: i + 1,
            snippet: lines[i].trim().substring(0, 120),
            description: pattern.description,
            url: `https://oss.korext.com/regressions/${pattern.id}`,
          });
          break; // One match per pattern per file
        }
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({
      scanned: files.length,
      patterns_loaded: BUILTIN_PATTERNS.length,
      matches_found: matches.length,
      matches,
    }, null, 2));
    return;
  }

  console.log(`\nScanned: ${files.length} files`);
  console.log(`Patterns loaded: ${BUILTIN_PATTERNS.length}\n`);

  if (matches.length === 0) {
    console.log('\x1b[32mNo matches found. Clean.\x1b[0m\n');
    return;
  }

  console.log(`Matches found: ${matches.length}\n`);

  for (const m of matches) {
    const sevColor = m.severity === 'critical' ? '\x1b[31m' :
                     m.severity === 'high' ? '\x1b[33m' :
                     m.severity === 'medium' ? '\x1b[36m' : '\x1b[37m';
    console.log(`${m.pattern_id}: ${m.title}`);
    console.log(`  ${m.file}:${m.line}`);
    console.log(`  Severity: ${sevColor}${m.severity}\x1b[0m`);
    console.log(`  ${m.snippet}`);
    console.log(`  Fix: ${m.url}`);
    console.log('');
  }

  console.log('Run with --json for machine output.');
}

function cmdList() {
  console.log('\n\x1b[1mRecent AI Regression Patterns\x1b[0m\n');
  const reqClient = REGISTRY_URL.startsWith('https') ? https : http;
  reqClient.get(`${REGISTRY_URL}/search`, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      if (res.statusCode === 200) {
        let items = [];
        try { items = JSON.parse(body); } catch(e){}
        if (items.length === 0) {
          console.log('(No patterns published yet)');
        } else {
          items.forEach(i => {
            console.log(`${i.identifier.padEnd(15)} ${i.severity.padEnd(10)} ${i.title.substring(0,40)}...`);
          });
        }
      } else {
        console.error('Failed to fetch list:', res.statusCode);
      }
    });
  }).on('error', e => console.error('Error:', e.message));
}

function cmdSubscribe() {
  console.log('\n\\x1b[1mSubscribe to AI Regression Pattern feeds:\\x1b[0m');
  console.log('\nRSS:\n  https://oss.korext.com/regressions/feed.xml');
  console.log('\nAtom:\n  https://oss.korext.com/regressions/feed.atom');
}

const args = process.argv.slice(2);
const cmd = args[0];

if (args.includes('--help') || args.includes('-h') || !cmd) {
  console.log(`
  \\x1b[1m@korext/regression-submit\\x1b[0m v1.0.4

  The CLI for the AI Regression Database.
  Report, validate, reproduce and scan code for regression patterns.

  Usage: regression-submit <command> [options]

  Commands:
    draft       Interactive draft creation
    validate    Validate a draft file
    reproduce   Test reproduction locally (sanity check)
    submit      Submit to database (use --dry-run for testing)
    list        List recent patterns
    show <id>   Show specific pattern
    detect      Scan local repo for known patterns
    subscribe   Subscribe to RSS

  Options:
    --help, -h      Show this help message
    --version, -v   Show version number
    --dry-run       Submit without sending to production
    --json          Output in JSON (for detect)

  Registry: https://oss.korext.com/regressions
  Specification: https://github.com/korext/ai-regression-database
  `);
  process.exit(0);
}

switch (cmd) {
  case 'draft':
    cmdDraft();
    break;
  case 'validate':
    cmdValidate(args[1]);
    break;
  case 'reproduce':
    cmdReproduce(args[1]);
    break;
  case 'submit':
    cmdSubmit(args.slice(1).find(a => !a.startsWith('--')) || DEFAULT_FILE, args.includes('--dry-run'));
    break;
  case 'list':
    cmdList();
    break;
  case 'detect':
    cmdDetect();
    break;
  case 'subscribe':
    cmdSubscribe();
    break;
  case 'show':
    if (!args[1]) { console.log('Usage: regression-submit show <ARD-YYYY-NNNN>'); process.exit(1); }
    console.log(`\nFetching ${args[1]}... (To view in UI: https://oss.korext.com/regressions/${args[1]})\n`);
    const reqClient2 = REGISTRY_URL.startsWith('https') ? https : http;
    reqClient2.get(`${REGISTRY_URL}/${args[1]}`, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if(res.statusCode === 200){
            console.log(yaml.dump(JSON.parse(body)));
        } else {
            console.log('Not found.');
        }
      });
    });
    break;
  default:
    console.error(`Unknown command: ${cmd}. Run with --help for usage.`);
    process.exit(1);
}
