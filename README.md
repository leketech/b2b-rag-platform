# B2B RAG Platform

AI-powered platform for B2B businesses to generate contracts, invoices, schedule meetings, and send automated reminders —o all backed by a Retrieval-Augmented Generation (RAG) pipeline.

## Features

- 📄 **Contract generation** — NDA, SoW, MSA with clause retrieval from your knowledge base
- 🧾 **Invoice generation** — Line items, tax, PDF export, Stripe payment links
- 📅 **Meeting scheduling** — Natural language scheduling with Cal.com / Google Calendar
- 🔔 **Reminders** — Automated email, SMS, and Slack notifications via Celery

## Architecture

```
apps/
  api/          # FastAPI backend (Python)
  web/          # Next.js frontend
infra/
  terraform/    # AWS infrastructure (EKS, RDS, Redis, S3)
  k8s/          # Kubernetes manifests (Kustomize)
scripts/
  ingest/       # Document ingestion pipeline
.github/
  workflows/    # CI/CD pipelines
```

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | GPT-4o / Claude 3.5 Sonnet |
| Embeddings | OpenAI text-embedding-3-small |
| Vector store | pgvector (dev) → Pinecone (prod) |
| Orchestration | LangChain |
| Backend | FastAPI + Celery + Redis |
| Frontend | Next.js 14 + Tailwind CSS |
| Database | PostgreSQL (RDS) |
| Storage | AWS S3 |
| Scheduling | Cal.com API / Google Calendar |
| Notifications | SendGrid + Twilio + Slack |
| Infrastructure | AWS EKS + Terraform + ArgoCD |
| Auth | Auth0 (multi-tenant B2B) |

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 20+
- AWS CLI (for infra)
- Terraform 1.6+

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_ORG/b2b-rag-platform.git
cd b2b-rag-platform

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys

# 3. Start all services
docker compose up -d

# 4. Run database migrations
cd apps/api
alembic upgrade head

# 5. Ingest seed documents
python scripts/ingest/run.py --source ./data/templates

# 6. Start the API (dev mode)
uvicorn app.main:app --reload

# 7. Start the frontend
cd apps/web
npm install && npm run dev
```

The API will be at `http://localhost:8000` and the UI at `http://localhost:3000`.

## Environment Variables

See `.env.example` for the full list. Key variables:

```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PINECONE_API_KEY=
DATABASE_URL=
REDIS_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
STRIPE_SECRET_KEY=
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
```

### Environment File Security

⚠️ **Never commit `.env` to version control!** It's already in `.gitignore`.

- `.env.example` is safe to commit — it shows what variables are needed but with placeholder values
- `.env` should be created locally or in CI/CD via GitHub Secrets

## GitHub Secrets for CI/CD

To enable secure CI/CD, set up the following secrets in your repository settings:

1. **Go to** `Settings → Secrets and variables → Actions`

2. **Add these secrets:**

   | Secret Name | Description |
   |---|---|
   | `DB_PASSWORD` | PostgreSQL database password for testing |
   | `OPENAI_API_KEY` | OpenAI API key for AI features |

   (Add more as needed for your integrations: `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `SENDGRID_API_KEY`, etc.)

3. **Example GitHub Actions usage:**
   ```yaml
   env:
     DATABASE_URL: postgresql+asyncpg://postgres:${{ secrets.DB_PASSWORD }}@localhost:5432/b2b_rag_test
     OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
   ```

## Project Phases

- [ ] **Phase 1** — RAG pipeline & document ingestion
- [ ] **Phase 2** — Contract & invoice generation
- [ ] **Phase 3** — Meeting scheduling integration
- [ ] **Phase 4** — Reminders & notifications
- [ ] **Phase 5** — Production infra (EKS + Terraform)
- [ ] **Phase 6** — Observability (Prometheus + Grafana + OTel)

## Contributing

1. Branch from `main`: `git checkout -b feat/your-feature`
2. Commit with conventional commits: `feat:`, `fix:`, `chore:`
3. Open a PR — CI must pass before merge

## License

MIT 
