# app/routers/favorites.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud
from app.database import SessionLocal

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST: agregar restaurante a favoritos
@router.post("/{restaurant_id}", response_model=schemas.Favorite)
def add_favorite(restaurant_id: int, db: Session = Depends(get_db)):
    return crud.add_favorite(db, restaurant_id)

# DELETE: eliminar de favoritos
@router.delete("/{restaurant_id}", response_model=schemas.Favorite)
def remove_favorite(restaurant_id: int, db: Session = Depends(get_db)):
    fav = crud.remove_favorite(db, restaurant_id)
    if not fav:
        raise HTTPException(status_code=404, detail="Favorito no encontrado")
    return fav

# GET: obtener top 10 favoritos recientes
@router.get("/", response_model=List[schemas.Favorite])
def get_favorites(db: Session = Depends(get_db)):
    return crud.get_recent_favorites(db)

