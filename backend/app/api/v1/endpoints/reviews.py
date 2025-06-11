from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Dict, Any
import asyncio

from app.services.google_reviews_service import GoogleReviewsService

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_reviews(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Number of reviews per page")
):
    """Get paginated Google Reviews for testimonials"""
    try:
        reviews_service = GoogleReviewsService()
        reviews = await reviews_service.get_recent_reviews(page=page, limit=limit)
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {str(e)}")

@router.get("/featured", response_model=List[Dict[str, Any]])
async def get_featured_reviews():
    """Get featured reviews for homepage testimonials"""
    try:
        reviews_service = GoogleReviewsService()
        reviews = await reviews_service.get_recent_reviews(limit=6)
        
        # Filter for the best reviews (5-star ratings first, then wedding-related)
        featured_reviews = []
        
        # First, get 5-star wedding-related reviews
        five_star_wedding = [
            review for review in reviews 
            if review.get("rating", 0) == 5 and review.get("is_wedding_related", False)
        ]
        featured_reviews.extend(five_star_wedding[:3])
        
        # If we need more, add other 5-star reviews
        if len(featured_reviews) < 3:
            five_star_others = [
                review for review in reviews 
                if review.get("rating", 0) == 5 and review not in featured_reviews
            ]
            featured_reviews.extend(five_star_others[:3 - len(featured_reviews)])
        
        # If still need more, add 4-star wedding-related reviews
        if len(featured_reviews) < 3:
            four_star_wedding = [
                review for review in reviews 
                if review.get("rating", 0) == 4 and review.get("is_wedding_related", False)
                and review not in featured_reviews
            ]
            featured_reviews.extend(four_star_wedding[:3 - len(featured_reviews)])
        
        return featured_reviews[:3]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured reviews: {str(e)}")

@router.get("/business-rating")
async def get_business_rating():
    """Get overall business rating from Google"""
    try:
        reviews_service = GoogleReviewsService()
        rating_data = await reviews_service.get_business_rating()
        return rating_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch business rating: {str(e)}")

@router.get("/stats")
async def get_review_stats():
    """Get comprehensive review statistics"""
    try:
        reviews_service = GoogleReviewsService()
        stats = await reviews_service.get_review_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch review stats: {str(e)}")

@router.get("/health")
async def reviews_health_check():
    """Health check endpoint for reviews service"""
    try:
        reviews_service = GoogleReviewsService()
        
        # Test the service with a small request
        test_reviews = await reviews_service.get_recent_reviews(limit=1)
        business_rating = await reviews_service.get_business_rating()
        
        return {
            "status": "healthy",
            "google_api_configured": bool(reviews_service.api_key and reviews_service.place_id),
            "sample_reviews_count": len(test_reviews),
            "business_rating": business_rating.get("rating", 0),
            "data_source": business_rating.get("source", "unknown"),
            "timestamp": test_reviews[0].get("created_at") if test_reviews else None
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "google_api_configured": False,
            "fallback_available": True
        }