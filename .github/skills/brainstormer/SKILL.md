---
name: brainstormer
description: 'Use for brainstorming, feature ideation, architectural planning, and breaking down complex problems. Guides the thought process before writing code.'
argument-hint: 'What feature or problem do you want to brainstorm?'
---

# Brainstormer Skill

This skill provides a structured methodology for ideation, system design, determining API schemas (like mapping out FH5 datasets), and problem-solving. Use this when the user needs to figure out *how* to build something, weigh different architectures, or plan a feature roadmap.

## When to Use
- Planning a new feature or complex component.
- Deciding between different architectural patterns or technologies (e.g., SQLite vs Turso).
- Breaking down a vague user request into actionable engineering tasks.
- Brainstorming performance optimizations or UI/UX improvements.

## Procedure

### 1. Context Gathering
- Clarify the user's ultimate goal. If the request is vague or relies heavily on previous context, summarize what you know so far.
- Ask probing questions (via the `ask-questions` tool or simply directly) regarding technical limits, timeframe, user experience goals, and edge cases.

### 2. Ideation (Divergent Phase)
- Propose 2-4 distinct, realistic approaches to solve the problem or architect the feature. 
- For each approach, briefly outline:
  - **How it works:** Core mechanism or data-flow.
  - **Pros:** Fast implementation? Scales well? Easy to debug?
  - **Cons:** High maintenance? Requires external proxies (e.g. BrightData)? Potential bottlenecks?

### 3. Evaluation & Recommendation (Convergent Phase)
- Compare the proposed approaches against the identified constraints.
- Provide a clear, opinionated recommendation on which approach is the most pragmatic or optimal given the context. (e.g., "Given your FH5 community tune setup, Option B is best").

### 4. Implementation Plan
- Formulate the recommended approach into a step-by-step technical checklist.
- Define exactly what files need modifying, new libraries to install (e.g., `https-proxy-agent`), and the sequence of operations.

## Output
Produce a final markdown summary showing the Ideas, the Recommendation, and the Step-by-Step implementation plan. Wait for user approval before generating any code.
