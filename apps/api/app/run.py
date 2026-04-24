#!/usr/bin/env python3
"""
CLI script to bulk-ingest documents into the RAG knowledge base.

Usage:
  python scripts/ingest/run.py --source ./data/templates
  python scripts/ingest/run.py --source ./data/templates --org-id <uuid>
  python scripts/ingest/run.py --file ./contracts/nda_template.pdf
"""
import argparse
import asyncio
import sys
from pathlib import Path

# Allow running from repo root
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "apps" / "api"))

from app.db.session import AsyncSessionLocal, init_db
from app.services.documents.ingestion import ingestion_service
import structlog

logger = structlog.get_logger()


async def main():
    parser = argparse.ArgumentParser(description="Ingest documents into the RAG knowledge base")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--source", type=str, help="Directory of documents to ingest")
    group.add_argument("--file", type=str, help="Single file to ingest")
    parser.add_argument("--org-id", type=str, default=None, help="Organization UUID (optional)")
    args = parser.parse_args()

    await init_db()

    async with AsyncSessionLocal() as db:
        if args.file:
            path = Path(args.file)
            if not path.exists():
                print(f"ERROR: file not found: {path}")
                sys.exit(1)
            count = await ingestion_service.ingest_file(db, path, args.org_id)
            print(f"✓ Ingested {path.name} → {count} chunks")

        elif args.source:
            directory = Path(args.source)
            if not directory.is_dir():
                print(f"ERROR: directory not found: {directory}")
                sys.exit(1)
            results = await ingestion_service.ingest_directory(db, directory, args.org_id)
            total = sum(v for v in results.values() if v > 0)
            errors = [k for k, v in results.items() if v < 0]
            print(f"\n✓ Ingestion complete: {len(results)} files, {total} total chunks")
            if errors:
                print(f"✗ Errors in: {', '.join(errors)}")


if __name__ == "__main__":
    asyncio.run(main())
