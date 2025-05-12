# app/main.py (actualizado)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .database import engine, Base
from .routers import restaurants, favorites, orders

# Crear las tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS: permitir acceso desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringirlo según el host del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Asegurar que existen los directorios de uploads
os.makedirs("thumbnails/restaurantes", exist_ok=True)
os.makedirs("thumbnails/comidas", exist_ok=True)

# Montar los directorios estáticos
app.mount("/thumbnails", StaticFiles(directory="thumbnails"), name="thumbnails")

# Rutas
app.include_router(restaurants.router)
app.include_router(favorites.router)
app.include_router(orders.router)