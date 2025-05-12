# app/models.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    thumbnail = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    order_count = Column(Integer, default=0)

    foods = relationship("Food", back_populates="restaurant", cascade="all, delete")
    favorites = relationship("Favorite", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")


class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    price = Column(Float, nullable=False)
    thumbnail = Column(String, nullable=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))

    restaurant = relationship("Restaurant", back_populates="foods")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    added_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="favorites")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    subtotal = Column(Float)
    tax = Column(Float)
    shipping = Column(Float)
    service = Column(Float)
    total = Column(Float)
    details = Column(String)  # JSON con las comidas (nombre, foto, precio, cantidad)

    restaurant = relationship("Restaurant", back_populates="orders")
