# AI Regression Database

The public corpus of code patterns that AI coding tools consistently generate incorrectly.

[![License: Code](https://img.shields.io/badge/code-Apache%202.0-blue)](LICENSE)
[![License: Spec](https://img.shields.io/badge/spec-CC0%201.0-green)](LICENSE-SPEC)
[![License: Data](https://img.shields.io/badge/data-CC%20BY%204.0-orange)](LICENSE-DATA)
[![npm](https://img.shields.io/npm/v/@korext/regression-submit)](https://www.npmjs.com/package/@korext/regression-submit)

Academic benchmarks measure AI coding tools on curated test sets. AI Incident Database documents production failures. Neither documents the repeatable patterns that AI coding tools reliably produce wrong in normal developer workflows.

AI Regression Database fills that gap. Every pattern includes reproduction steps, correct alternatives, and detection rules.

## Browse the Database

[oss.korext.com/regressions](https://oss.korext.com/regressions)

## Document a Pattern

```bash
npx @korext/regression-submit draft
```

Anonymous submissions welcome.

## Scan Your Code

```bash
npx @korext/regression-submit detect
```

This scans your repository for patterns matching all published ARDs.

## Identifier Format

ARD-YYYY-NNNN

Example: ARD-2026-0042

## What Belongs Here

A pattern is an ARD candidate when:

- AI coding tools reliably produce incorrect or suboptimal code given recognizable prompt patterns.
- The pattern is reproducible at least 3 out of 10 attempts.
- The pattern has a clear correct alternative.
- The pattern is observed in normal developer workflows, not adversarial prompts.

## Six Categories

- **security**: introduces security vulnerabilities
- **correctness**: output does not match intent
- **performance**: poor algorithmic or systems performance
- **hallucination**: nonexistent APIs, libraries, or documentation
- **compliance**: violates regulatory or industry standards
- **maintainability**: difficult to maintain

## Unique Features

This database differs from academic benchmarks in critical ways:

- **Practitioner observed**: patterns from real developer workflows, not curated tests
- **Reproducible**: every pattern has reproduction steps
- **Version tracked**: patterns are retested against current AI tool versions
- **Detection linked**: every pattern maps to detection rules
- **Time series**: reproduction rates tracked over time
- **Vendor responses**: AI tool vendors can respond to patterns

## Test Harness

The database includes an automated test harness that reproduces patterns against current AI tool versions weekly. When vendors ship fixes, patterns are marked fixed automatically with public recognition of the improvement.

## Ethical Commitments

1. No AI tool shaming. This is neutral infrastructure.
2. Reproducibility over anecdotes. Unrepeatable claims are rejected.
3. Version awareness. Tools improve. We track improvement.
4. No adversarial use. Patterns are for defense, not jailbreaking.
5. Contributor attribution. Contributors get credit for their observations.
6. Vendor notification. 7 day notification before publication.

See [ETHICS.md](ETHICS.md).

## Relationship to Other Projects

| Project | Purpose |
|---------|---------|
| ai-attestation | Tracks which AI tools wrote code |
| ai-license | Declares AI authorship |
| supply-chain-attestation | Scans AI across dependencies |
| ai-incident-registry | Catalogs AI code failures (incidents) |
| ai-code-radar | Live statistics on AI adoption |
| **ai-regression-database** | **Catalogs AI code patterns that are wrong (patterns)** |

ARD documents patterns. AICI documents incidents. Patterns can cause incidents. Incidents reference patterns.

## Feeds

- RSS: https://oss.korext.com/regressions/feed.xml
- Atom: https://oss.korext.com/regressions/feed.atom

## API

See [API documentation](https://oss.korext.com/regressions/api).

## Specification

See [SPEC.md](SPEC.md). Released under [CC0 1.0](LICENSE-SPEC).

## Data License

All pattern data is released under [CC BY 4.0](LICENSE-DATA). Attribution to the database and contributor is required.

## Prior Art

See [PRIOR_ART.md](PRIOR_ART.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Built by

[Korext](https://korext.com) builds AI code governance tools. AI Regression Database is an open community resource maintained by the Korext team.
