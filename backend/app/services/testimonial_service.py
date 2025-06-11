from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

class TestimonialService:
    def __init__(self, db: Session):
        self.db = db

    async def get_testimonials(
        self,
        city: Optional[str] = None,
        rating: Optional[int] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Testimonial]:
        """Get testimonials with optional filtering"""
        query = self.db.query(Testimonial)

        if city:
            query = query.filter(Testimonial.city == city)
        if rating:
            query = query.filter(Testimonial.rating == rating)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Testimonial.name.ilike(search_term),
                    Testimonial.comment.ilike(search_term),
                    Testimonial.city.ilike(search_term)
                )
            )

        return query.offset(skip).limit(limit).all()

    async def get_cities(self) -> List[str]:
        """Get all testimonial cities"""
        result = self.db.query(Testimonial.city).distinct().all()
        return [row[0] for row in result] 