# Taxonomy for AI Regression Database

This document outlines the structured vocabulary schemas for tracking variables within the AI Regression Database.

## Categories

- **security**: Patterns that introduce security vulnerabilities 
- **correctness**: Patterns where output does not match intent 
- **performance**: Patterns with poor algorithmic or systems performance 
- **hallucination**: Patterns where AI generates nonexistent APIs, libraries, or documentation 
- **compliance**: Patterns that violate regulatory or industry standards 
- **maintainability**: Patterns that produce code difficult to maintain 

## Pattern Types

- **injection**: SQL, NoSQL, command, template, XPath, LDAP injection.
- **authentication**: bypass, weak, missing.
- **authorization**: missing, incorrect, escalation.
- **cryptography**: weak, misused, deprecated.
- **data-exposure**: logging secrets, PII leakage, verbose errors.
- **resource**: memory leak, DoS, unbounded iteration.
- **logic**: off-by-one, race condition, incorrect comparison.
- **api-fabrication**: nonexistent API calls.
- **library-fabrication**: nonexistent library imports.
- **documentation-fabrication**: fake references to docs.
- **type-confusion**: type errors in typed languages.
- **async-race**: race conditions in async code.
- **null-handling**: missing null checks.
- **edge-case**: edge cases not handled.
- **error-handling**: missing or incorrect error handling.
- **outdated-pattern**: deprecated patterns from old training data.
- **over-engineering**: unnecessarily complex solutions.
- **under-engineering**: solutions missing critical features.
- **accessibility**: accessibility issues in generated UI code.
- **i18n**: internationalization issues.
- **locale**: locale-specific bugs.

## Confidence Levels

- **low**: Pattern reported once, inconsistent reproduction.
- **medium**: Pattern reproduced by multiple contributors, consistent enough to document.
- **high**: Pattern reproduced by multiple contributors, rate >= 0.5, reviewed by maintainers.

## Status Lifecycle

- **draft**: Being composed.
- **submitted**: Sent to database.
- **under_review**: Maintainers investigating.
- **published**: Live in database.
- **fixed**: All tracked AI tools fixed the pattern (entry preserved for historical record).
- **withdrawn**: Retracted.
