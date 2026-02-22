import os
import psycopg2


base_dir = os.path.dirname(__file__)
CA_CERT_PATH = os.path.join(base_dir, "..", "app", "certs", "prod-ca-2021.crt")
if not os.path.exists(CA_CERT_PATH):
    CA_CERT_PATH = os.path.join(base_dir, "..", "app", "prod-ca-2021.crt")

DB_NAME = os.getenv("SUPABASE_DB_NAME", "postgres")
USER = os.getenv("SUPABASE_DB_USER", "")
PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "")
HOST = os.getenv("SUPABASE_DB_HOST", "")
PORT = os.getenv("SUPABASE_DB_PORT", "6543")

if not USER or not PASSWORD or not HOST:
    raise RuntimeError(
        "Missing required env vars. Set SUPABASE_DB_USER, SUPABASE_DB_PASSWORD, SUPABASE_DB_HOST"
    )

if not os.path.exists(CA_CERT_PATH):
    raise RuntimeError(f"CA cert file not found at: {CA_CERT_PATH}")

try:
    conn_string = (
        f"dbname={DB_NAME} user={USER} password={PASSWORD} "
        f"host={HOST} port={PORT} "
        f"sslmode=verify-full sslrootcert={CA_CERT_PATH}"
    )

    conn = psycopg2.connect(conn_string)
    print("Connection successful with SSL!")

    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    db_version = cursor.fetchone()
    print(f"PostgreSQL database version: {db_version}")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"An error occurred: {e}")
