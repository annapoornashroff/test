"""
Script to seed the database with sample data for development
"""
import asyncio
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import *
from decimal import Decimal
from datetime import datetime, timedelta

def seed_vendors(db: Session):
    """Seed vendor data"""
    vendors_data = [
        {
            "name": "Royal Photography Studio",
            "category": "Photography",
            "location": "Mumbai",
            "description": "Professional wedding photography with cinematic style",
            "price_min": Decimal("50000"),
            "price_max": Decimal("200000"),
            "rating": Decimal("4.8"),
            "review_count": 156,
            "contact_phone": "+91 98765 43210",
            "contact_email": "info@royalphotography.com",
            "is_featured": True,
            "images": [
                "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg",
                "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg"
            ],
            "services": ["Wedding Photography", "Pre-wedding Shoot", "Candid Photography"],
            "portfolio": [
                "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg"
            ]
        },
        {
            "name": "Spice Garden Catering",
            "category": "Catering",
            "location": "Delhi",
            "description": "Multi-cuisine catering with authentic Indian flavors",
            "price_min": Decimal("800"),
            "price_max": Decimal("1500"),
            "rating": Decimal("4.9"),
            "review_count": 203,
            "contact_phone": "+91 87654 32109",
            "contact_email": "orders@spicegarden.com",
            "is_featured": True,
            "images": [
                "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg"
            ],
            "services": ["Indian Cuisine", "Continental", "Live Counters"],
            "portfolio": []
        },
        {
            "name": "Elegant Decorators",
            "category": "Decoration",
            "location": "Bangalore",
            "description": "Theme-based wedding decorations and floral arrangements",
            "price_min": Decimal("100000"),
            "price_max": Decimal("500000"),
            "rating": Decimal("4.7"),
            "review_count": 89,
            "contact_phone": "+91 76543 21098",
            "contact_email": "info@elegantdecorators.com",
            "is_featured": False,
            "images": [
                "https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg"
            ],
            "services": ["Theme Decoration", "Floral Arrangements", "Lighting"],
            "portfolio": []
        }
    ]
    
    for vendor_data in vendors_data:
        vendor = Vendor(**vendor_data)
        db.add(vendor)
    
    db.commit()
    print("✅ Vendors seeded successfully")

def seed_packages(db: Session):
    """Seed package data"""
    packages_data = [
        {
            "name": "Royal Wedding Package",
            "description": "A luxurious wedding experience with premium vendors",
            "price": Decimal("500000"),
            "original_price": Decimal("700000"),
            "discount_percentage": 29,
            "duration": "3 Days",
            "is_popular": True,
            "image_url": "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg",
            "includes": [
                "Premium Venue Booking",
                "Professional Photography & Videography",
                "Luxury Catering (250 guests)",
                "Theme-based Decoration",
                "Bridal Makeup & Hair",
                "DJ & Sound System",
                "Wedding Coordination"
            ],
            "vendors": [
                {"category": "Photography", "vendor_name": "Royal Photography Studio", "vendor_id": 1},
                {"category": "Catering", "vendor_name": "Spice Garden Catering", "vendor_id": 2},
                {"category": "Decoration", "vendor_name": "Elegant Decorators", "vendor_id": 3}
            ]
        },
        {
            "name": "Intimate Wedding Package",
            "description": "Perfect for smaller, intimate wedding celebrations",
            "price": Decimal("250000"),
            "original_price": Decimal("350000"),
            "discount_percentage": 29,
            "duration": "2 Days",
            "is_popular": False,
            "image_url": "https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg",
            "includes": [
                "Boutique Venue",
                "Professional Photography",
                "Catering for 100 guests",
                "Floral Decoration",
                "Bridal Makeup",
                "Music System",
                "Basic Coordination"
            ],
            "vendors": []
        }
    ]
    
    for package_data in packages_data:
        package = Package(**package_data)
        db.add(package)
    
    db.commit()
    print("✅ Packages seeded successfully")

def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Vendor).count() > 0:
            print("⚠️  Database already contains data. Skipping seeding.")
            return
        
        # Seed data (removed testimonials)
        seed_vendors(db)
        seed_packages(db)
        
        print("🎉 Database seeding completed successfully!")
        print("📝 Note: Testimonials are now integrated with Google Reviews API")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()