# AI Regression Database Specification

Version 1.0
Released under CC0 1.0 Universal (public domain).

## What This Is

AI Regression Database documents code patterns that AI coding tools systematically generate incorrectly. Each pattern is a reproducible case where AI tools produce code that is wrong, suboptimal, or that consistently misses a critical detail.

Every pattern receives a unique identifier in the format ARD-YYYY-NNNN and a public entry with reproduction steps, correct alternatives, and detection rules.

## Identifier Format

`ARD-YYYY-NNNN`

- **ARD**: AI Regression Database
- **YYYY**: four digit year
- **NNNN**: zero padded sequential number

Example: `ARD-2026-0042`

## Scope

ARD covers patterns where:

- AI coding tools reliably produce incorrect, suboptimal, or unsafe code given recognizable prompt patterns.
- The pattern is reproducible (at least 3 out of 10 attempts with the documented prompt pattern).
- The pattern has a clear correct alternative.
- The pattern can be documented without requiring deep jailbreaking of the AI tool.

Out of scope:

- Adversarial prompts designed to break AI tools (research this elsewhere).
- One-off hallucinations that cannot be reproduced.
- Personal preferences about coding style.
- Bugs in AI tool UIs or integrations.

## What This Is Not

ARD is not a ranking of AI tools. It is a pattern library. Every AI tool has failure modes. This database helps practitioners detect and prevent them.

## Pattern Schema

```yaml
# AI Regression Pattern
# Released under CC BY 4.0
# Code examples under CC0 1.0

schema: https://oss.korext.com/regressions/schema
version: "1.0"

identifier: ARD-2026-0042

status: published
# draft | submitted | under_review | published | fixed | withdrawn

title: "String concatenation in SQL WHERE clause instead of parameterization"

summary: |
  When prompted to build database query functions, AI coding tools frequently produce string concatenated SQL queries instead of parameterized queries. This creates SQL injection vulnerability.

category: security
# security | correctness | performance | hallucination | compliance | maintainability

severity: high
# informational | low | medium | high | critical

discovered_date: 2026-03-12
reported_date: 2026-03-18
published_date: 2026-03-25
last_reproduced: 2026-04-14

pattern_type: injection
# Controlled vocabulary from TAXONOMY.md

language:
  primary: JavaScript
  variants_observed: [TypeScript, Node.js]

ai_tools:
  - name: GitHub Copilot
    confirmed_in_versions: ["1.145", "1.148"]
    last_tested_version: "1.152"
    reproduction_rate: 0.7
    status: still_present
    # still_present | partially_fixed | fixed | inconclusive
    last_test_date: 2026-04-14

  - name: Cursor
    confirmed_in_versions: ["0.42", "0.43"]
    last_tested_version: "0.45"
    reproduction_rate: 0.4
    status: partially_fixed
    last_test_date: 2026-04-14

prompt_patterns:
  triggers:
    - "build user search function"
    - "filter results by"
    - "WHERE clause with user input"
  context_factors:
    - "No ORM in existing codebase"
    - "MySQL or PostgreSQL"
    - "User input parameter named 'name' or 'query'"

incorrect_pattern:
  code: |
    // JavaScript example
    async function searchUsers(name) {
      const query = `SELECT * FROM users
        WHERE name = '${name}'`;
      return await db.query(query);
    }
  explanation: |
    String interpolation allows user input to become part of the SQL query structure, enabling SQL injection attacks.

correct_pattern:
  code: |
    async function searchUsers(name) {
      const query = 'SELECT * FROM users
        WHERE name = ?';
      return await db.query(query, [name]);
    }
  explanation: |
    Parameterized queries separate SQL structure from user input. The database driver handles escaping.

root_cause_hypothesis: |
  Training data contains many tutorial examples using string concatenation for SQL queries, especially in older JavaScript content. The pattern appears simpler and is frequently shown as a "first example" before the tutorial introduces parameterization.

reproduction_steps:
  prerequisites:
    - AI coding tool installed
    - Empty JavaScript file
  steps:
    - Create a new file user-search.js
    - Type comment "// function to search users by name"
    - Accept AI suggestion
    - Observe: high probability of string concatenated SQL
  expected_rate: 0.7 out of 10 attempts

severity_justification: |
  SQL injection is among the most exploited vulnerability classes. High reproduction rate means this pattern is likely in many production codebases where AI assistance was used without review.

impact_assessment:
  security_impact: high
  exploitability: high
  detection_difficulty: medium

detection:
  korext_packs:
    - web-security
  korext_rule_ids:
    - sqli-string-concat-001
  semgrep_rules:
    - javascript.lang.security.audit.sqli.node-mysql-sqli
  codeql_queries:
    - js/sql-injection
  custom_detection:
    regex: "db\\.query\\s*\\(\\s*`[^`]*\\$\\{"
    language: JavaScript

related_incidents:
  - identifier: AICI-2026-0047
    description: "Production incident at undisclosed company"

related_patterns:
  - ARD-2026-0015
  - ARD-2026-0028

references:
  - type: owasp
    url: https://owasp.org/...
  - type: cwe
    id: CWE-89
  - type: article
    url: https://example.com/...

vendor_response:
  - vendor: GitHub Copilot
    response_date: 2026-03-22
    statement: "We are aware of this pattern and have improvements planned for version X.X"
  - vendor: Cursor
    response_date: 2026-03-23
    statement: "Partially addressed in v0.44. Tracking for complete fix."

contributor:
  name: null
  organization: null
  contact: null
  verified: true

maintainer_notes:
  review_date: 2026-03-24
  reviewed_by: registry-team
  confidence: high
  # low | medium | high

change_log:
  - date: 2026-04-14
    change: "Retested. Cursor reproduction rate down to 0.4 in v0.45. Status updated to partially_fixed."
  - date: 2026-03-25
    change: "Published after vendor notification period."
```
