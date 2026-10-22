# Code review: `/webhook` endpoint (`app.py`)

Line numbers refer to the Python listing in the task, counting `# app.py` as line 1.

**Verdict: needs changes before approval.** The change is the right shape — small, single-purpose, and the signature check is already factored into its own function — but two blocking security issues and a spec gap mean it does not yet improve code health. Every item below is a small fix; one more round should get this to LGTM.

Labels: unlabelled = required. **Nit** = optional polish. **FYI** = no action in this CL.

## Blocking

**L42, L47 — SQL built with f-strings.** `email` and the raw body are attacker-controlled, so this is an injection path into both tables. Use parameterised queries:

```python
cursor.execute(
    "INSERT INTO webhook_audit(email, raw_json) VALUES (?, ?)",
    (email, raw_body.decode("utf-8")),
)
```

**L35, L47 — `role` is taken from the vendor payload unvalidated.** `{"role": "admin"}` creates an admin. Whether the vendor should set role at all is a design question worth settling first; if yes, allow-list it (e.g. `{"user", "vendor"}`) and return 400 otherwise.

## Required

**L10 — `WEBHOOK_SECRET` defaults to `"dev-secret"`.** If the env var is missing in prod, every signature is forgeable. Fail fast: `WEBHOOK_SECRET = os.environ["WEBHOOK_SECRET"]` and set it locally via the environment. Same pattern on L9 (`/tmp/app.db`), lower stakes.

**L45–47 — not an upsert.** Plain `INSERT` either duplicates users or raises `IntegrityError` on repeat deliveries (vendors retry). The spec asks for upsert:

```python
"INSERT INTO users(email, role) VALUES (?, ?) "
"ON CONFLICT(email) DO UPDATE SET role = excluded.role"
```

**L34–35 — no payload validation.** Empty email is accepted; a non-object JSON body raises on `.get`; `metadata.source == "vendor"` from the spec is never checked. Validate shape and required fields → 400.

**L37 — connection never closed, no rollback on error.** Leaks one connection per request; Style guide §3.11 names database connections explicitly. `with contextlib.closing(get_db()) as db, db:` gives close plus commit/rollback.

**L20 — `expected == sig`.** Use `hmac.compare_digest(expected, sig)` to avoid timing leaks.

**L17, L30 — unhandled decode/parse errors.** Non-UTF-8 or invalid JSON → 500. Catch `UnicodeDecodeError` / `json.JSONDecodeError` → 400. Consider setting `MAX_CONTENT_LENGTH`.

**L40–50 — failed events are not audited.** The audit row runs after the signature check and shares a transaction with the user write, so a failed upsert loses the audit too. Write the audit first, in its own commit, including rejected signatures — that is what the audit table is for.

**Tests — none in the CL.** Minimum set: valid sig → 200 + rows; bad sig → 401; duplicate event → one user row; `role=admin` rejected; malformed JSON → 400.

**Docstrings & annotations (§3.8.2, §3.8.3, §2.21).** Module docstring (replace `# app.py`); docstrings on `verify()` and `webhook()` — move the L32–33 example payload into it; annotate `sig: str` and `get_db() -> sqlite3.Connection`.

## Good things

Small, focused CL; signature verification is factored out and the L16 comment explains *why*; config through env vars with CAPS constants; `.get()` defaults instead of `KeyError`s.
