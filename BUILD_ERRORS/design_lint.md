# Design Lint — dated / off-system UI patterns

These are NON-BLOCKING suggestions. The build is not failed. Fix them to
keep the app on the design system and looking modern.

- Files scanned: 18
- AI-slop patterns (gradient hero / three-card row / 0.1 shadows / centered hero): 0
- Raw Tailwind colors: 0 (use semantic tokens: bg-primary / text-text / border-border)
- Inline hex colors: 0 (use tokens, not hex literals)
- Text-rendered icons / emoji: 0 (use <Icon name="..." /> from @/components/ui)
- Interactive elements without hover/focus state: 1

## Findings
- [no_interaction] src/game/GameCanvas.tsx — `onClick handler(s) with no hover/focus/transition styling`
