# Singular Base Check — Open Findings

SQLAlchemy's `declarative_base()` builds a brand-new metadata registry on every call.  More than one call in the repo creates two roots, which silently breaks relationships, Alembic migrations, and `__tablename__` uniqueness.

**Policy:** declare `Base = declarative_base()` exactly once, at `src/database/base.py`.  Every other file uses:

```python
from src.database.base import Base
```

⚠️  Canonical Base file missing: `src/database/base.py` does not declare `Base = declarative_base()`.


### Implicated lesson: D-1

LESSON D-1 — SINGLE CANONICAL DB SESSION (no duplicates):
- There is EXACTLY ONE database session file: src/database/session.py
- ALL code MUST import from: from src.database.session import get_db
- NEVER create alternative session files (src/core/database.py, src/db/session.py, etc.)
- Use SYNCHRONOUS SQLAlchemy only: create_engine + sessionmaker + Session (no async variants)
- Enforced by: V13d (mapper config).