# Delivery

Part of [system-shape.md](system-shape.md) · tag `[DELIVERY]`

## Repo layout
```text
ns_interview/
├── README.md                 # start here for reviewers
├── code-review/
└── code-challenge/calculator/
    ├── docs/                 # this design
    ├── backend/              # app/ tests/ pyproject.toml Dockerfile
    ├── frontend/             # src/ tests/ package.json Dockerfile
    └── docker-compose.yml
```

## One-command run
`docker compose up` serves the frontend on 5173 and the backend on 8000, with OpenAPI at `/docs`.
Without Docker: `uv run fastapi dev` and `npm run dev`.

## CI, GitHub Actions
```text
push ─▶ backend:  ruff + pytest  ─┐
    └▶ frontend: eslint + vitest ─┴─▶ green = mergeable
```

## README must answer
1. How to run it in one command.
2. Why the backend owns the maths.
3. Which inputs are rejected and why.
4. What is out of scope.
5. AI prompts, and what the AI did well or poorly (gist follow-up 4).

Commits: Conventional Commits, small steps matching [build-order.md](build-order.md).
