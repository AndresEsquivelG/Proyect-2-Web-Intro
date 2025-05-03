from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    creationDate = Column(DateTime, default=datetime.utcnow)
    type = Column(String, nullable=False)
    thumbnailPath = Column(String, default="default.jpg")

    # Relaciones
    favorite = relationship("Favorite", back_populates="restaurant", uselist=False)
    meals = relationship("RestaurantMeals", back_populates="restaurant", cascade="all, delete")
    orders = relationship("Orders", back_populates="restaurant", cascade="all, delete")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    restaurantID = Column(Integer, ForeignKey("restaurants.id"))
    favoriteDate = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="favorite")


class RestaurantMeals(Base):
    __tablename__ = "restaurant_meals"

    id = Column(Integer, primary_key=True, index=True)
    restaurantID = Column(Integer, ForeignKey("restaurants.id"))
    name = Column(String(150), nullable=False)
    thumbnailPath = Column(String, default="default.jpg")
    price = Column(Float, nullable=False)

    restaurant = relationship("Restaurant", back_populates="meals")
    orderedMeals = relationship("OrderMeals", back_populates="meal", cascade="all, delete")


class Orders(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    restaurantID = Column(Integer, ForeignKey("restaurants.id"))
    creationDate = Column(DateTime, default=datetime.utcnow)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    shippingCost = Column(Float, nullable=False)
    serviceCost = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    restaurant = relationship("Restaurant", back_populates="orders")
    orderedMeals = relationship("OrderMeals", back_populates="order", cascade="all, delete")


class OrderMeals(Base):
    __tablename__ = "order_meals"

    id = Column(Integer, primary_key=True, index=True)
    orderID = Column(Integer, ForeignKey("orders.id"))
    mealID = Column(Integer, ForeignKey("restaurant_meals.id"))
    amount = Column(Integer, nullable=False)

    order = relationship("Orders", back_populates="orderedMeals")
    meal = relationship("RestaurantMeals", back_populates="orderedMeals")
