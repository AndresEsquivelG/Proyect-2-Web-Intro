# app/routers/orders.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud
from app.database import SessionLocal

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST: Crear pedido
@router.post("/{restaurant_id}", response_model=schemas.Order)
def create_order(restaurant_id: int, order: schemas.OrderCreate, db: Session = Depends(get_db)):
    rest = crud.get_restaurant_by_id(db, restaurant_id)
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return crud.create_order(db, restaurant_id, order)

# GET: Ver pedidos de un restaurante
@router.get("/{restaurant_id}", response_model=List[schemas.Order])
def get_orders(restaurant_id: int, db: Session = Depends(get_db)):
    rest = crud.get_restaurant_by_id(db, restaurant_id)
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return crud.get_orders_for_restaurant(db, restaurant_id)

