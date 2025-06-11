from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, weddings, vendors, packages, cart, guests, reviews

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(weddings.router, prefix="/weddings", tags=["weddings"])
api_router.include_router(vendors.router, prefix="/vendors", tags=["vendors"])
api_router.include_router(packages.router, prefix="/packages", tags=["packages"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(guests.router, prefix="/guests", tags=["guests"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])