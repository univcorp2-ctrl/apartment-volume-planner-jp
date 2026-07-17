# CODEX.md

## Goal
Maintain a transparent, testable early-stage apartment feasibility calculator for Japan.

## Guardrails
- Never describe the output as a building permit approval or final legal opinion.
- Every regulatory rule must include jurisdiction, effective date, source URL, and test cases.
- Keep deterministic geometry and rule evaluation separate from any LLM-assisted extraction.
- Add regression tests whenever a calculation or legal rule changes.
- Do not commit API keys. Document only secret names.

## Quality commands
- `npm run check`
- `npm run build`
