# Forever N Co. Backend API

## 🚀 FastAPI Backend with PostgreSQL

This is the backend API for Forever N Co., a comprehensive Indian wedding services e-commerce platform.

## 🏗️ Architecture

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT with OTP verification
- **External Services**: Twilio (SMS), SendGrid (Email), Stripe (Payments)

## 📋 Features

### Core Functionality
- ✅ User authentication with OTP
- ✅ Wedding project management
- ✅ Vendor browsing and filtering
- ✅ Shopping cart and wishlist
- ✅ Guest list management
- ✅ Package customization
- ✅ SMS notifications
- ✅ Email integration

### API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - Send OTP for login
- `POST /api/v1/auth/verify-otp` - Verify OTP and get token
- `POST /api/v1/auth/signup` - Create new user account

#### Users
- `GET /api/v1/users/me` - Get current user info
- `PUT /api/v1/users/me` - Update user profile
- `DELETE /api/v1/users/me` - Delete user account

#### Weddings
- `POST /api/v1/weddings/` - Create wedding project
- `GET /api/v1/weddings/` - Get user's weddings
- `GET /api/v1/weddings/{id}` - Get specific wedding
- `PUT /api/v1/weddings/{id}` - Update wedding
- `DELETE /api/v1/weddings/{id}` - Delete wedding

#### Vendors
- `GET /api/v1/vendors/` - Get vendors with filtering
- `GET /api/v1/vendors/{id}` - Get vendor details
- `GET /api/v1/vendors/categories` - Get vendor categories
- `GET /api/v1/vendors/cities` - Get vendor cities
- `GET /api/v1/vendors/featured` - Get featured vendors

#### Packages
- `GET /api/v1/packages/` - Get all packages
- `GET /api/v1/packages/{id}` - Get package details
- `GET /api/v1/packages/popular` - Get popular packages

#### Cart
- `POST /api/v1/cart/` - Add item to cart
- `GET /api/v1/cart/` - Get cart items
- `PUT /api/v1/cart/{id}` - Update cart item
- `DELETE /api/v1/cart/{id}` - Remove from cart
- `GET /api/v1/cart/summary` - Get cart summary

#### Guests
- `POST /api/v1/guests/` - Add guest
- `GET /api/v1/guests/` - Get wedding guests
- `PUT /api/v1/guests/{id}` - Update guest
- `DELETE /api/v1/guests/{id}` - Delete guest
- `POST /api/v1/guests/{id}/send-invitation` - Send invitation
- `GET /api/v1/guests/statistics` - Get guest statistics

#### Reviews
- `GET /api/v1/reviews/` - Get paginated reviews
  - Query Parameters:
    - `page` (int, default=1): Page number
    - `limit` (int, default=10, max=50): Number of reviews per page
  - Response:
    ```json
    {
      "reviews": [
        {
          "id": "string",
          "name": "string",
          "city": "string",
          "rating": "number",
          "comment": "string",
          "image": "string",
          "wedding_date": "string",
          "created_at": "string",
          "source": "string",
          "is_wedding_related": "boolean",
          "relative_time": "string"
        }
      ],
      "total": "number",
      "page": "number",
      "limit": "number",
      "total_pages": "number"
    }
    ```
- `GET /api/v1/reviews/featured` - Get featured reviews (5-star wedding-related)
- `GET /api/v1/reviews/rating` - Get business rating and stats
- `GET /api/v1/reviews/health` - Check reviews service health

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

**Required Environment Variables:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/forever_n_co
SECRET_KEY=your-secret-key-here
```

**Optional External Services:**
```env
# Twilio for SMS
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# SendGrid for Email
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@forevernco.com

# Stripe for Payments
STRIPE_SECRET_KEY=your-stripe-secret-key

# Redis for caching
REDIS_URL=redis://localhost:6379
```

### 3. Database Setup

#### Option A: Provide Connection String
If you have a PostgreSQL database ready, just update the `DATABASE_URL` in your `.env` file.

#### Option B: Local PostgreSQL Setup
```bash
# Install PostgreSQL
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# macOS:
brew install postgresql

# Create database
sudo -u postgres createdb forever_n_co

# Create user (optional)
sudo -u postgres createuser --interactive
```

### 4. Run Database Migrations

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 5. Seed Sample Data

```bash
python scripts/seed_data.py
```

### 6. Start Development Server

```bash
# Option 1: Direct uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using the dev script
python scripts/run_dev.py

# Option 3: Using the main module
python -m app.main
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📊 Database Schema

### Core Tables
- **users** - User accounts and profiles
- **weddings** - Wedding projects and details
- **vendors** - Service providers and their information
- **packages** - Pre-configured wedding packages
- **cart_items** - Shopping cart and wishlist items
- **guests** - Wedding guest lists and RSVP tracking
- **testimonials** - Customer reviews and feedback

### Key Relationships
- Users can have multiple wedding projects
- Each wedding can have multiple cart items and guests
- Vendors can be associated with multiple cart items
- Packages contain vendor mappings and pricing

## 🔧 Development Tools

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Testing
```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

### Code Quality
```bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

## 🚀 Production Deployment

### Environment Variables
Set all required environment variables in your production environment.

### Database
- Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Enable connection pooling
- Set up regular backups

### Security
- Use strong SECRET_KEY
- Enable HTTPS
- Set up proper CORS origins
- Use environment-specific configurations

### Monitoring
- Set up logging
- Monitor API performance
- Track database queries
- Set up health checks

## 📝 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Integration with Frontend

The backend is designed to work seamlessly with the Next.js frontend. Update the frontend's API client configuration:

```typescript
// frontend/lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

## 📞 Support

For development support or questions about the backend implementation, refer to the main project README or create an issue in the repository.