# etherAI Server

## Setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Set `MONGO_URI` in `.env` (local MongoDB, Atlas, or Railway).

## Run

```bash
npm run dev
```

Health check:

- `GET /api/health`
