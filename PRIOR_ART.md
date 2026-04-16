# Prior Art: AI Regression Database

The AI Regression Database (ARD) aims to be the structured, queryable, reproducible source of AI coding pitfalls that currently only exists informally. This document explores the landscape of AI assessment benchmarks and why ARD is category-creating.

## Academic Benchmarks

### HumanEval (OpenAI)
- **Scope**: 164 programming problems with tests. Static dataset.
- **License**: MIT.
- **How ARD Differs**: ARD is built on practitioner-observed patterns, not curated problems. It focuses on the patterns of mistakes rather than pass/fail metrics.

### MBPP (Google)
- **Scope**: 974 entry-level Python problems. Static dataset.
- **License**: Apache 2.0.
- **How ARD Differs**: ARD tracks dynamic, real-world regressions instead of static problem-solving capabilities.

### SWE-bench (Princeton)
- **Scope**: Real-world GitHub issues with test suites. Agent benchmark.
- **How ARD Differs**: ARD focuses on individual code generation patterns and localized pitfalls, not repository-scale resolution logic.

### LiveCodeBench (UCLA)
- **Scope**: Competitive programming benchmark refreshed dynamically.
- **How ARD Differs**: ARD models real-world enterprise engineering patterns, not competitive or algorithmic exercises.

## Vendor Evaluations

OpenAI, Anthropic, Google, and GitHub consistently publish performance numbers tied to academic benchmarks. ARD diverges from these inherently insular evaluations by positioning as a community-owned, tool-agnostic index of regression data.

## Informal Community Efforts

Currently, developers track AI pitfalls through "awesome" lists on GitHub or X/Twitter threads. These are:
- Unstructured.
- Often lacking standardization or reproduction steps.
- Devoid of actionable detection rules.

## Sister Projects in Korext Ecosystem

- **`ai-attestation`**: Tracks authorship of AI-generated code.
- **`ai-license`**: Declares AI authorship usage rules.
- **`supply-chain-attestation`**: Scans the ecosystem's supply chain.
- **`ai-incident-registry`**: Reactive database documenting failures.

**AI Regression Database** proactively categorizes structural patterns *before* they cause the incidents filed under the registry. ARD patterns directly correlate to AICI events, providing comprehensive insight from generative tendency to production failure.
