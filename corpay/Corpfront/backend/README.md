# Dashboard Backend API

FastAPI backend for the Corpay Dashboard system.

## Start the backend (recommended)

From this directory (`Corpfront/backend`), use the run script. It creates a venv if missing, installs dependencies, and starts the server:

**macOS / Linux:**
```bash
./run.sh
```

**Windows:**
```bat
start_backend.bat
```

The server runs at **http://0.0.0.0:8000**. Admin user is created automatically on startup (see `app/main.py` lifespan).

One-off admin/setup scripts are in `scripts/`; see `scripts/README.md`.

---

## Setup (manual)

### Quick Start with Supabase (Recommended)

1. Create and use the venv:
```bash
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. Set up Supabase database:
   - Create a project at [https://app.supabase.com](https://app.supabase.com)
   - Get your database connection string from Settings → Database
   - Run the setup script:
   ```bash
   python setup_supabase.py
   ```
   - Or manually create a `.env` file with your Supabase connection string
   - See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions

3. Run database migrations:
```bash
alembic upgrade head
```

4. Start the server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Alternative: Local SQLite Setup (Development Only)

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. The default configuration uses SQLite (no setup needed)

3. Start the server:
```bash
uvicorn app.main:app --reload --port 8000
```

**Note:** For production, use Supabase PostgreSQL database. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for details.

## Environment knobs

- `SHARE_PRICE_MAX_AGE_SECONDS` (default: `60`): maximum age (in seconds) of a scraped share price before the backend re-scrapes `https://investor.corpay.com/stock-information`. Lower values force fresher prices.

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### Public Dashboard Endpoints
- `GET /api/dashboard/revenue` - Get total revenue
- `GET /api/dashboard/share-price` - Get share price
- `GET /api/dashboard/revenue-trends` - Get revenue trends
- `GET /api/dashboard/revenue-proportions` - Get revenue proportions
- `GET /api/dashboard/posts` - Get Corpay posts
- `GET /api/dashboard/cross-border-posts` - Get Cross-Border posts
- `GET /api/dashboard/employees` - Get employee milestones
- `GET /api/dashboard/payments` - Get payment data
- `GET /api/dashboard/system-performance` - Get system performance

### Admin Endpoints (Require Authentication)
- `GET /api/admin/auth/login/{provider}` - OAuth login (google/microsoft)
- `GET /api/admin/auth/callback` - OAuth callback
- `POST /api/admin/revenue/upload` - Upload revenue Excel
- `POST /api/admin/posts` - Create post
- `POST /api/admin/employees/upload` - Upload employee data
- `POST /api/admin/payments/upload` - Upload payments Excel
- `POST /api/admin/system/upload` - Upload system performance Excel
- `GET /api/admin/config` - Get API configuration
- `PUT /api/admin/config` - Update API configuration

## File Upload Formats

### Revenue Excel File
Expected sheets:
1. Total revenue and percentage change
2. Revenue trends (Month, Value, Highlight)
3. Revenue proportions (Category, Percentage)

### Payments Excel File
Expected columns: Date, Amount Processed, Transaction Count

### System Performance Excel File
Expected columns: Uptime Percentage, Success Rate

### Employee Data Excel File
Expected columns: Name, Description, Department, Milestone Type, Date

## Development

Run with auto-reload:
```bash
uvicorn app.main:app --reload
```

Run migrations:
```bash
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

