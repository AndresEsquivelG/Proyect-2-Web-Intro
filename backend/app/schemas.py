# app/schemas.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# === Comidas ===
class FoodCreate(BaseModel):
    name: str = Field(..., max_length=150)
    price: float
    thumbnail: Optional[str] = None  # ruta al archivo

class Food(FoodCreate):
    id: int
    restaurant_id: int

    class Config:
        orm_mode = True


# === Restaurante ===
class RestaurantBase(BaseModel):
    name: str = Field(..., max_length=100)
    type: str
    thumbnail: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    foods: List[FoodCreate] = []

class Restaurant(RestaurantBase):
    id: int
    created_at: datetime
    order_count: int
    foods: List[Food] = []

    model_config = {
    "from_attributes": True
}



# === Favoritos ===
class Favorite(BaseModel):
    id: int
    restaurant_id: int
    added_at: datetime

    model_config = {
    "from_attributes": True
}



# === Pedidos ===
class OrderBase(BaseModel):
    subtotal: float
    tax: float
    shipping: float
    service: float
    total: float
    details: str  # JSON string con resumen de comidas

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    restaurant_id: int
    created_at: datetime

    model_config = {
    "from_attributes": True
}

