# app/routers/restaurants.py (modificado)

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
from app import schemas, crud
from app.database import SessionLocal
import json

router = APIRouter(
    prefix="/restaurants",
    tags=["Restaurants"]
)

#directorios de imágenes
UPLOAD_DIR = "thumbnails"
RESTAURANT_DIR = os.path.join(UPLOAD_DIR, "restaurantes")
FOOD_DIR = os.path.join(UPLOAD_DIR, "comidas")
os.makedirs(RESTAURANT_DIR, exist_ok=True)
os.makedirs(FOOD_DIR, exist_ok=True)


# Dependencia para obtener sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para guardar una imagen y devolver su ruta
def save_image(file: UploadFile, directory: str) -> str:
    if not file:
        return None
    
    #nombre [unico
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(directory, filename)
    
    # Guardar el archivo
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return f"/{directory}/{filename}"

# GET: todos los restaurantes
@router.get("/", response_model=List[schemas.Restaurant])
def get_restaurants(db: Session = Depends(get_db)):
    return crud.get_all_restaurants(db)

# GET: restaurante por ID
@router.get("/{restaurant_id}", response_model=schemas.Restaurant)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    db_rest = crud.get_restaurant_by_id(db, restaurant_id)
    if not db_rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return db_rest

# POST: agregar restaurante con imágenes
@router.post("/", response_model=schemas.Restaurant)
async def create_restaurant(
    name: str = Form(...),
    type: str = Form(...),
    restaurant_image: Optional[UploadFile] = File(None),
    meals_data: str = Form(...),
    db: Session = Depends(get_db)
):
    restaurant_thumbnail = None
    if restaurant_image:
        restaurant_thumbnail = save_image(restaurant_image, RESTAURANT_DIR)
    
    meals = json.loads(meals_data)
    
    restaurant_data = schemas.RestaurantCreate(
        name=name,
        type=type,
        thumbnail=restaurant_thumbnail,
        foods=[]
    )
    return crud.create_restaurant(db, restaurant_data)

# POST: agregar comida con imagen a un restaurante
@router.post("/{restaurant_id}/foods", response_model=schemas.Food)
async def add_food(
    restaurant_id: int,
    name: str = Form(...),
    price: float = Form(...),
    food_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):

    restaurant = crud.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    food_thumbnail = None
    if food_image:
        food_thumbnail = save_image(food_image, FOOD_DIR)
    
    food_data = schemas.FoodCreate(
        name=name,
        price=price,
        thumbnail=food_thumbnail
    )
    
    return crud.add_food_to_restaurant(db, restaurant_id, food_data)

# GET: top 10 más pedidos
@router.get("/top/ordered", response_model=List[schemas.Restaurant])
def top_ordered_restaurants(db: Session = Depends(get_db)):
    return crud.get_top_ordered_restaurants(db)

# GET: buscar por nombre o tipo
@router.get("/search/", response_model=List[schemas.Restaurant])
def search_restaurants(query: str, db: Session = Depends(get_db)):
    all_restaurants = crud.get_all_restaurants(db)
    return [
        r for r in all_restaurants
        if query.lower() in r.name.lower() or query.lower() in r.type.lower()
    ]