from typing import Literal, Optional
from pydantic import BaseModel, Field


class ProductIn(BaseModel):
    id: Optional[int] = None
    name: str = Field(min_length=1)
    category: str = Field(min_length=1)
    brand: str = Field(min_length=1)
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    image: str = ""


class CustomerIn(BaseModel):
    name: str = Field(min_length=2)
    email: str
    phone: str
    address: str
    city: str
    pincode: str


class OrderItemIn(BaseModel):
    productId: int
    name: str = ""
    qty: int = Field(gt=0)
    price: float = 0  # ignored: the server uses the price stored in the database


class OrderIn(BaseModel):
    customer: CustomerIn
    payment: Literal["UPI", "Card", "Net Banking", "Cash"]
    total: float = 0  # ignored: the server recalculates the total
    items: list[OrderItemIn] = Field(min_length=1)
class StatusIn(BaseModel):
    status: str    