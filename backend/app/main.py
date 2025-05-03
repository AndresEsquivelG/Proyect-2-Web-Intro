from fastapi import FastAPI
from app import models
from app.database import engine

# Crear las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Servidor funcionando. Base de datos creada correctamente."}
