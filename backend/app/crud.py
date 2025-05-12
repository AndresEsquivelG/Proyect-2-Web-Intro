# app/crud.py

from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

# === RESTAURANTES ===

def get_all_restaurants(db: Session):
    return db.query(models.Restaurant).order_by(models.Restaurant.created_at.desc()).all()

def create_restaurant(db: Session, restaurant: schemas.RestaurantCreate):
    db_restaurant = models.Restaurant(
        name=restaurant.name,
        type=restaurant.type,
        thumbnail=restaurant.thumbnail,
        created_at=datetime.utcnow()
    )
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)

    # Agregar comidas asociadas
    for food in restaurant.foods:
        db_food = models.Food(
            name=food.name,
            price=food.price,
            thumbnail=food.thumbnail,
            restaurant_id=db_restaurant.id
        )
        db.add(db_food)

    db.commit()
    return db_restaurant


def get_restaurant_by_id(db: Session, restaurant_id: int):
    return db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()


# Agregar esta función a app/crud.py
def add_food_to_restaurant(db: Session, restaurant_id: int, food: schemas.FoodCreate):
    db_food = models.Food(
        name=food.name,
        price=food.price,
        thumbnail=food.thumbnail,
        restaurant_id=restaurant_id
    )
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food

# === FAVORITOS ===

def add_favorite(db: Session, restaurant_id: int):
    favorite = models.Favorite(restaurant_id=restaurant_id)
    db.add(favorite)
    db.commit()
    return favorite

def remove_favorite(db: Session, restaurant_id: int):
    fav = db.query(models.Favorite).filter(models.Favorite.restaurant_id == restaurant_id).first()
    if fav:
        db.delete(fav)
        db.commit()
    return fav

def get_recent_favorites(db: Session, limit: int = 10):
    return db.query(models.Favorite).order_by(models.Favorite.added_at.desc()).limit(limit).all()

# === PEDIDOS ===

def create_order(db: Session, restaurant_id: int, order: schemas.OrderCreate):
    db_order = models.Order(
        restaurant_id=restaurant_id,
        subtotal=order.subtotal,
        tax=order.tax,
        shipping=order.shipping,
        service=order.service,
        total=order.total,
        details=order.details,
        created_at=datetime.utcnow()
    )

    db.add(db_order)

    # Incrementar conteo de pedidos
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if restaurant:
        restaurant.order_count += 1

    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders_for_restaurant(db: Session, restaurant_id: int):
    return db.query(models.Order).filter(models.Order.restaurant_id == restaurant_id).order_by(models.Order.created_at.desc()).all()

def get_top_ordered_restaurants(db: Session, limit: int = 10):
    return db.query(models.Restaurant).order_by(models.Restaurant.order_count.desc()).limit(limit).all()
