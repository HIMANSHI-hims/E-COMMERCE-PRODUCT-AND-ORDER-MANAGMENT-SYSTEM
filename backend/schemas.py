import re
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_RE = re.compile(r"[0-9]{10}")


class ProductIn(BaseModel):
    id: Optional[int] = None
    name: str = Field(min_length=1)
    category: str = Field(min_length=1)
    brand: str = Field(min_length=1)
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    image: Optional[str] = ""

    @field_validator("image", mode="before")
    @classmethod
    def _image(cls, v):
        return (v or "").strip()


class OrderItemIn(BaseModel):
    productId: int
    name: str = ""
    qty: int = Field(gt=0)
    price: float = 0  # ignored: the server uses the price stored in the database


class OrderIn(BaseModel):
    payment: Literal["UPI", "Card", "Net Banking", "Cash"]
    items: list[OrderItemIn] = Field(min_length=1)


class StatusIn(BaseModel):
    status: str


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=100)
    phone: str
    address: str = Field(min_length=5, max_length=200)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("name", "address")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address")
        return v

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.fullmatch(v):
            raise ValueError("Enter a 10-digit mobile number")
        return v


class CustomerLoginIn(BaseModel):
    email: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=72)