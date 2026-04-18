# Contributing

We welcome contributions to the AI
Regression Database. Here is how to
get involved.

## Reporting a New Pattern

If you have observed an AI coding
tool consistently producing
incorrect code:

1. Run `npx @korext/regression-submit draft`
   to create a structured draft
2. Include reproduction steps with
   at least 10 attempts documented
3. Include the incorrect and correct
   code patterns
4. Run `npx @korext/regression-submit validate`
   to check the draft
5. Run `npx @korext/regression-submit submit`

Minimum reproduction rate: 3 out of
10 attempts.

## Improving Detection Rules

Each pattern includes detection
rules (regex, AST patterns, or
Korext rule IDs). If you can
improve a detection rule:

1. Fork the repository
2. Edit the pattern YAML file
3. Test the new detection rule
   against known examples
4. Submit a PR with test evidence

## Community Reproduction

Help verify existing patterns by
testing them against current AI
tool versions. Visit the pattern
page on oss.korext.com/regressions
and submit a community reproduction
report.

## Adding a New Pattern Type

To propose a new pattern type for
the taxonomy:

1. Open an issue describing the
   proposed type
2. Include at least 3 example
   patterns that would fall under
   the new type
3. Explain why existing types do
   not cover these patterns

## Code Style

The CLI uses Node.js built-ins and
js-yaml only. No additional
dependencies.

## Pull Request Process

1. Fork the repository
2. Create a branch from main
3. Make your changes
4. Test locally
5. Submit a PR with a clear
   description
6. Wait for maintainer review
