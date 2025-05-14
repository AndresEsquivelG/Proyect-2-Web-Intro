import os
import sqlite3

db_path = "database.db"  # Ajusta esta ruta si tu archivo está en otra carpeta

# Verifica que exista el archivo
if not os.path.exists(db_path):
    print(f"❌ No se encontró el archivo en: {db_path}")
    exit()

# Conectar
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Mostrar nombres de las tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

if not tables:
    print("⚠️ No se encontraron tablas en la base de datos.")
else:
    print("\n📋 Tablas disponibles:")
    for name in tables:
        print(" -", name[0])

    # Mostrar contenido con nombres de columnas
    for name in tables:
        print(f"\n🔍 Contenido de la tabla: {name[0]}")

        # Obtener nombres de columnas
        cursor.execute(f"PRAGMA table_info({name[0]})")
        columns = [col[1] for col in cursor.fetchall()]
        print(" 🧾 Columnas:", columns)

        # Obtener datos
        cursor.execute(f"SELECT * FROM {name[0]}")
        rows = cursor.fetchall()
        if rows:
            for row in rows:
                print(row)
        else:
            print(" (sin datos)")

conn.close()
