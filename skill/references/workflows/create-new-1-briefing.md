---
name: new-phase-1-briefing
description: "Phase 1: Briefing"
category: workflow
---

# Phase 1: Briefing

## What is a brief

A brief is the agreement on what this presentation is for — who the audience is, what to tell them, and what action to drive.

It answers: "What are we making, for whom, and why?" It does NOT answer "how do we structure it" — that belongs to the outline phase.

A brief is NOT an outline. It does not mention slides, slide counts, per-slide topics, or story structure. Those belong to the outline phase, which comes after this.

## Deliverable

`specs/brief.md` — approved by the user.

You MUST NOT read the next workflow file until the user explicitly approves `specs/brief.md`.

## Constraints

- You MUST NOT skip this phase regardless of slide count or content simplicity because skipping leads to unfocused slides
- This phase requires user dialogue — you MUST NOT proceed without explicit user agreement
- You MUST NOT read any other workflow file until `specs/brief.md` is approved
- You MUST NOT produce an outline, slide structure, or per-slide breakdown — that is a separate workflow
- You MUST NOT select a template — that belongs to a later workflow
- You MUST ask the user where to create the deck before running `init`, and pass that path via `-o` — never guess the location or rely on the default output directory
- Before each question, briefly explain what you are doing and what the user needs to decide
- Speak in the user's language, using plain words
- Use inference-based proposals: recommend with rationale — let the user confirm or redirect
- You MUST confirm all prerequisites before writing the brief
- You MUST extract the main message from conversation or source material — do NOT invent
- You MUST NOT state any number, percentage, or quantified effect unless it comes from the conversation, the user's source material, or a citable source URL. If you cannot point to where a number came from, do NOT use it — describe the effect qualitatively instead (e.g. "significantly faster" rather than a fabricated "10x faster"). Hallucinated metrics destroy credibility.
- You MUST define expected outcome as a concrete action

## Steps

### 1. Hearing

1. Understand the subject of the presentation

2. Confirm prerequisites with numbered choices. The user can answer concisely (e.g., 1=a, 2=b, 3=c, 4=a, 5=b).

**[1] Audience:** a. Executives  b. Engineers  c. Sales  d. Mixed  e. Other

**[2] Prior knowledge:** a. Expert  b. Intermediate  c. Beginner  d. Mixed

**[3] Setting:** a. Internal meeting  b. Proposal/Sales  c. Conference  d. Webinar  e. Other

**[4] Duration:** a. Short (5-10 min)  b. Standard (15-30 min)  c. Long (45-60 min)  d. Workshop (60+ min)

Presentation length ≠ slide count. Slide count depends on information density and visual approach — do not cap it (progressive disclosure and storyboard styles use many slides but take little time).

Ask follow-up questions based on answers when needed (e.g., executives → what decision are they making?).

3. Extract main message — infer from the conversation and source material, then recommend one. The message should be a single sentence that captures what the audience should take away.

**Hints for the agent (do not show these labels to the user):**
- Problem-solution: "[Problem] solved by [solution]"
- Impact: "[Proposal] achieves [effect]"
- Comparative: "[New approach] is [advantage] over [current]"
- Opportunity: "[New technology] enables [benefit]"

Good: A clear assertion of what changes for the audience (30-60 characters)
Bad: "I will explain about ~" (no assertion)

Numbers strengthen a message, but only use a specific number/percentage when it is grounded in the conversation, the user's source material, or a citable source URL. Never invent a figure to make the message sound sharper — when you have no source, assert the effect qualitatively and, if useful, ask the user whether they have a concrete figure to back it up.

Example (number is grounded — the user said deployment dropped from 2h to 10min):

> Based on what you've told me, the core message could be:
> "Feature X cuts deployment time from 2 hours to 10 minutes"
>
> Does this capture what you want to convey? Or is the emphasis different?

Example (no source for a figure — stay qualitative and ask):

> The core message could be:
> "Feature X makes deployments dramatically faster"
>
> Do you have a concrete before/after number (and a source) we could cite? A specific figure would make this land harder, but I won't put a number in without one.

4. Define expected outcome — infer from audience attributes and main message. The outcome should be a concrete action the audience takes after the presentation.

Example:

> After this presentation, the audience should:
> "Start a PoC with Feature X in their own environment within 2 weeks"
>
> Is that the kind of action you're hoping for?

5. Confirm everything before proceeding:

> **Audience**: Engineers, intermediate knowledge, internal meeting, 15 min
> **Main message**: "Feature X cuts deployment time from 2 hours to 10 minutes"
> **Expected outcome**: Start a PoC within 2 weeks
>
> Shall we proceed with this?

### 2. Initialize working directory

Once the hearing gives enough understanding of the presentation content, initialize the working directory.

Before running `init`, you MUST ask the user where to create the deck. Do NOT guess
the location or fall back to the default — always confirm the output directory with
the user first, then pass it explicitly via `-o`.

Ask plainly, e.g.:

> Where should I create this deck? Give me a directory path
> (e.g. `~/Documents/decks` or `./decks`), and I'll create it under there.

Once the user gives a path, run `init` with `-o <user-path>/{name}`:

```bash
uv run python3 scripts/pptx_builder.py init {name} -o <user-path>/{name}
```

This generates `brief.md` and `outline.md` under `specs/`.

### 3. Write brief

Write `specs/brief.md` with the following:

- Purpose, persona, presentation length (from prerequisites)
- Main message and expected outcome
- Overall context: background, technical context, audience situation, meeting positioning, success criteria
- What to say to the audience, what to make them feel, what action to drive

Write in natural prose, not bullet points. Prose reveals gaps in logic that bullet points hide.

Add the following sections at the end of the brief:

**Constraints & Requests** — capture explicit constraints and preferences from the dialogue:
```markdown
## Constraints & Requests
- [MUST NOT] Do not include pricing details
- [MUST] Include the demo architecture diagram
- [PREFER] Use dark theme if possible
```
Omit this section if no constraints were mentioned.

**Materials** — list any files or assets the user provided or referenced:
```markdown
## Materials
| File | Description | Target Slide |
|------|-------------|--------------|
| logo.png | Company logo | title |
| arch.png | Architecture diagram | architecture |
```
Omit this section if no materials were provided.

### 4. Wait for user review

Present `specs/brief.md` to the user and wait for explicit approval of the file.
Tell the user that the next step is outline design — breaking the brief into per-slide messages.
Do NOT assume approval. Do NOT proceed on partial agreement.
Verbal agreement during conversation is not sufficient — the user must review the written file.

---

## Next Step

Once the user explicitly approves `specs/brief.md`, read `create-new-1-outline` and proceed to outline design.
Do not proceed without approval of the file.
