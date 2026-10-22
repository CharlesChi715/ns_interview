# Code Review — Follow-up Questions

Each prompt block below answers both follow-up questions at once: the prompt and the AI output (Q1, output collapsed), then what I hoped for / what it did / whether I re-prompted / whether I changed approach (Q2).

**Tool:** Claude Code — Sonnet 5.5 for prompt 1, Fable 5.1 for prompts 2–7. The resulting review is in `Code_review.md`.

## Approach

My approach was to **ground the model in authoritative reference material before asking it anything about the code**. Pre-loading "golden standard" documents into the context is the same mechanism as retrieval-augmented generation minus the retrieval step, and a large body of research on grounding shows that it reduces hallucination. My own experience matches: with the standards in context the model's output is noticeably more coherent and better aligned with how professionals actually do the work, and it is far less likely to invent rules. For a code review the obvious references are Google's Engineering Practices (how to review) and the Google Python Style Guide (what to review against).

Before loading them I wanted to know how much context they would consume, so the first prompt only asks for links and a word count. I also did not expect the AI to be right about everything, nor did I assume my own findings were all correct — so I gave it my list and asked it to judge mine and add its own, then filtered its answers myself before moving on.

---

## Prompt 1

```text
find Google Engineering Practices Document and Google style guides for Python
language Find the links of them first and output how many words of them totally
before read them
```

<details>
<summary>AI output (condensed)</summary>

Found both sources, cloned/fetched the raw Markdown into a scratch directory and counted with `wc -w` without reading the content:

| Document | Words |
|---|---|
| Eng Practices — Reviewer guide (7 pages) | 6,299 |
| Eng Practices — Developer guide (4 pages) | 4,146 |
| Eng Practices — index + emergencies | 972 |
| **Eng Practices total** | **11,417** |
| **Python Style Guide** | **15,138** |
| **Total** | **26,555** |

Links: `https://google.github.io/eng-practices/` (source `github.com/google/eng-practices`), `https://google.github.io/styleguide/pyguide.html` (source `github.com/google/styleguide`). Added a reading-time estimate of ~2 h.

</details>

- **What I hoped for:** Locate the two reference documents and tell me their total size *without* reading them yet, so I could decide whether loading them was affordable.
- **What it did:** Exactly that — links, per-document word counts, total. The actual context cost once read turned out to be ~60k tokens (the Python guide alone was 44.6k tokens — Markdown anchors and code blocks inflate it beyond the word count).
- **Re-prompt needed:** No.
- **Approach change:** No.

---

## Prompt 2

```text
That could fit in the context, read them for context augmentation. Don't output
anything yet.
```

*AI output:* read all 13 Engineering Practices pages and the full Python Style Guide (two passes — the file exceeded the single-read cap), confirmed loaded, no summary.

- **What I hoped for:** Load both documents fully into context, silently.
- **What it did:** As asked.
- **Re-prompt needed:** No.
- **Approach change:** No.

---

## Prompt 3

```text
My colleague or team member was given the following task: [task spec]
Read it but dont output anything yet.
[app.py]
```

*AI output:* acknowledged both and held all observations.

- **What I hoped for:** Load the task spec and the PR code without the model jumping into a review before I framed the question.
- **What it did:** As asked.
- **Re-prompt needed:** No.
- **Approach change:** No.

---

## Prompt 4

```text
the issues i found: SQL injection in L42,47; Empty email ("") gets inserted;
DB connection never closed; No upsert; "dev-secret" shouldnt be exposed; Vendor
can assign role=admin; Give me a table of what do you think of the issue I found
and what's other issues you found. The first column of the table is the content
of each and the second column is the level of severity
```

<details>
<summary>AI output (condensed)</summary>

Agreed with all six of my findings and rated them, then added ten more:

| Finding | Severity | Source |
|---|---|---|
| SQL injection via f-strings (L42, L47) | Critical | mine |
| Vendor payload sets `role`, incl. `admin` (L35, L47) | Critical | mine |
| Default secret `"dev-secret"` (L10) | High | mine |
| No upsert — plain INSERT (L47) | High | mine |
| Empty email accepted; no type check on payload (L34) | Medium | mine |
| DB connection never closed; no rollback (L37) | Medium | mine |
| `metadata.source == "vendor"` never checked (L34–35) | Medium | AI |
| Non-constant-time signature compare (L20) | Medium | AI |
| Non-UTF-8 / invalid JSON → unhandled 500; no size limit (L17, L30) | Medium | AI |
| Failed events not audited; audit shares transaction with user write (L40–50) | Medium | AI |
| No tests in the PR | Medium | AI |
| `SHA256(secret + body)` is not an HMAC (vendor-defined) | Low | AI |
| No schema creation / migration | Low | AI |
| Email not normalised (case/whitespace) | Low | AI |
| `DB_PATH` defaults to `/tmp/app.db` (L9) | Low | AI |
| Flask dev server on `0.0.0.0` (L55) | Low | AI |

</details>

- **What I hoped for:** A second opinion on my six findings (I did not assume they were all valid) plus anything I had missed, with severity so I could prioritise.
- **What it did:** Confirmed all six with severities, added five Medium and five Low issues.
- **Re-prompt needed:** No — but I filtered the output: I accepted all five Medium additions and dropped the Lows as not worth the author's attention in this round.
- **Approach change:** No.

---

## Prompt 5

```text
I agree with all the medium issues u listed. What's your take in terms of the
Python style guide
```

<details>
<summary>AI output (condensed)</summary>

A 13-row table with style-guide section numbers and a Required / Should-fix / Nit classification:

| Section | Finding | Level |
|---|---|---|
| §3.11 | DB connection not closed via `with` / `contextlib.closing()` — the guide names DB connections explicitly | Required |
| §3.8.2 | No module docstring (and no license boilerplate) | Required |
| §3.8.3 | No docstrings on `verify()` (non-obvious logic) or `webhook()` (public API) | Required |
| §2.21 / §3.19.1 | Inconsistent annotations: `sig` untyped, no return types on `get_db()` / `webhook()` | Required |
| §3.13, §3.5, §3.2, §3.10 | Import order, blank lines, L42 length, `'__main__'` quotes — all fixable by `pyink` + `pylint` | Required (mechanical) |
| §3.8.5 | `# simple compare`, `# bytes`, `# Upsert user` describe *what*, not *why*; L45 describes code that isn't there | Should fix |
| §2.2, §3.16, §3.17, §3.10.2 | `from flask import Flask` (symbol import), abbreviations (`sig`, `cur`, `raw`), no `main()`, terse `"bad sig"` | Nit |

Also listed what the file does right (4-space indent, CAPS constants, `__main__` guard, `.get()` defaults).

</details>

- **What I hoped for:** A separate pass through the lens of the style guide it had loaded, with section references, so the style comments would be grounded rather than taste.
- **What it did:** Delivered the sectioned table above and noted that most mechanical items disappear with the formatter and linter.
- **Re-prompt needed:** No. I accepted the first four (§3.11, §3.8.2, §3.8.3, §2.21) and left the rest.
- **Approach change:** No.

---

## Prompt 6

```text
i agree with the first 4 pieces. Generate well structured concise code review
for me following the resources u found
```

<details>
<summary>AI output (condensed)</summary>

The review now in `Code_review.md`, with the verdict "needs changes before approval", plus two further sections that I later removed:

- **Nit:** run `pyink` + `pylint`; the three *what*-not-*why* comments (L20, L24, L45); rename `sig` / `cur` / `raw` / `verify`; normalise email before upsert.
- **FYI:** vendor hash is not an HMAC (length-extension); confirm the `users` / `webhook_audit` schema is created elsewhere.

</details>

- **What I hoped for:** The final review, written the way the Engineering Practices document says to: lead with design/blocking issues, explain *why* for each comment, label severity, note good things, give a verdict.
- **What it did:** Produced the review in that format: Blocking → Required → Nit → FYI → Good things, with a verdict.
- **Re-prompt needed:** Yes — see Prompt 7.
- **Approach change:** —

---

## Prompt 7

```text
I'm thinking of a remove Nit and FYI part.
```

<details>
<summary>AI output (condensed)</summary>

Agreed. Suggested folding two of the nits into existing required items (the `pyink`/`pylint` line into the docstrings item; email normalisation into the upsert item), dropping the rest, and keeping the one-sentence **Good things** section because the Engineering Practices guide treats encouragement as part of a review.

</details>

- **What I hoped for:** A shorter review. Even though I had asked for "concise", the output still carried six optional items that would add reading load for the author without changing the outcome.
- **What it did:** Agreed and proposed the folds above. I kept **Good things** and removed the Nit and FYI sections outright; `Code_review.md` is the Prompt 6 output with those two sections cut.
- **Re-prompt needed:** This *was* the re-prompt.
- **Approach change:** Yes. If I did this again I would specify the reading budget up front in Prompt 6 — e.g. "required items only, no optional sections, under N comments" — instead of asking for "concise" and trimming afterwards. "Concise" is too vague a constraint for a model that has just loaded a 26k-word standard telling it to label and include nits.
