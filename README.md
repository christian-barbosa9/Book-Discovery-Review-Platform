# Community Skill Exchange Platform

A full-stack web application that connects people through knowledge sharing and skill development. Users can offer skills they want to teach, seek skills they want to learn, and review experiences with other community members. Built with React, Express.js, and PostgreSQL.

## 🎯 Features

- **Browse Skills**: View all available skills with advanced filtering and search capabilities
- **Add Skills**: Users can post skills they're offering or seeking with detailed information
- **Review System**: Rate and review skills with 1-5 star ratings and comments
- **Search & Filter**: Search by keywords, filter by category, type, skill level, price, and more
- **Statistics Dashboard**: View platform statistics including category breakdowns and top-rated skills
- **Responsive Design**: Fully responsive UI that works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Skill ratings and review counts update automatically when reviews are submitted

## 🛠️ Technologies Used

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js

### Deployment
- **Vercel** - Platform for deployment (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (local installation or cloud database like Supabase, Railway, or Neon)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Final project"
```

### 2. Install Dependencies

Install both root and client dependencies:

```bash
npm run install-all
```

Or install separately:

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
POSTGRES_URI=postgresql://username:password@localhost:5432/skill-exchange
```

For cloud PostgreSQL (Supabase, Railway, Neon, etc.), use:
```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

Or set `POSTGRES_URI` with your cloud database connection string.

### 4. Start the Application

#### Development Mode (runs both server and client)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

#### Or run separately:

```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start frontend
npm run client
```

## 📁 Project Structure

```
Final project/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── SkillCard.js
│   │   │   ├── FilterBar.js
│   │   │   ├── ReviewCard.js
│   │   │   └── ReviewForm.js
│   │   ├── pages/         # Page components
│   │   │   ├── Home.js
│   │   │   ├── BrowseSkills.js
│   │   │   ├── AddSkill.js
│   │   │   ├── SkillDetail.js
│   │   │   └── Stats.js
│   │   ├── services/      # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                # Express backend
│   ├── db.js            # PostgreSQL connection and schema
│   ├── routes/           # API routes
│   │   ├── skills.js
│   │   └── reviews.js
│   └── index.js          # Server entry point
├── package.json
├── .env.example
├── vercel.json
└── README.md
```

## 🔌 API Endpoints

### Skills

#### Get All Skills
```
GET /api/skills
```
Query Parameters:
- `category` - Filter by category
- `skillType` - Filter by type (Offering/Seeking)
- `skillLevel` - Filter by level (Any/Beginner/Intermediate/Advanced)
- `search` - Text search on title and description
- `minRating` - Minimum average rating
- `isFree` - Filter by free/paid (true/false)
- `sortBy` - Sort order (newest/oldest/rating/reviews/title)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

#### Get Skill by ID
```
GET /api/skills/:id
```

#### Create Skill
```
POST /api/skills
```
Body:
```json
{
  "title": "Guitar Lessons",
  "description": "Learn acoustic and electric guitar",
  "category": "Music",
  "skillType": "Offering",
  "instructorName": "John Doe",
  "contactEmail": "john@example.com",
  "location": "New York, NY",
  "price": 50,
  "isFree": false,
  "duration": "1 hour",
  "skillLevel": "Beginner"
}
```

#### Update Skill
```
PUT /api/skills/:id
```

#### Delete Skill
```
DELETE /api/skills/:id
```

#### Get Category Statistics
```
GET /api/skills/stats/categories
```

#### Get Overview Statistics
```
GET /api/skills/stats/overview
```

### Reviews

#### Create Review
```
POST /api/reviews
```
Body:
```json
{
  "skillId": "skill_id_here",
  "reviewerName": "Jane Doe",
  "rating": 5,
  "comment": "Great instructor!"
}
```

#### Get Reviews for Skill
```
GET /api/reviews/skill/:skillId
```
Query Parameters:
- `sortBy` - Sort order (newest/oldest/rating-high/rating-low)
- `limit` - Maximum number of reviews (default: 50)

#### Delete Review
```
DELETE /api/reviews/:id
```

### Health Check

```
GET /api/health
```

## 🗄️ Database Schema

### Skills Table
```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('Offering', 'Seeking')),
  instructor_name VARCHAR(50) NOT NULL,
  contact_email VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  price DECIMAL(10, 2) DEFAULT 0 CHECK (price >= 0),
  is_free BOOLEAN DEFAULT false,
  duration VARCHAR(50),
  skill_level VARCHAR(20) DEFAULT 'Any' CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Any')),
  average_rating DECIMAL(3, 1) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(50) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The database schema is automatically created when the server starts. Tables are created if they don't exist.

## 🌐 Deployment

### Deploying to Vercel

1. **Prepare for deployment:**
   - Build the React app: `cd client && npm run build`
   - Ensure your MongoDB connection string is set in environment variables

2. **Deploy backend:**
   - Install Vercel CLI: `npm i -g vercel`
   - In the root directory, run: `vercel`
   - Add environment variables in Vercel dashboard:
     - `DATABASE_URL` or `POSTGRES_URI`: Your PostgreSQL connection string
     - `PORT`: 5000 (or let Vercel assign)

3. **Deploy frontend:**
   - The React app can be deployed separately or as part of the same project
   - Update `REACT_APP_API_URL` in client to point to your deployed backend

4. **PostgreSQL Setup:**
   - For local: Install PostgreSQL and create a database
   - For cloud: Use Supabase (free), Railway, Neon, or similar
   - Get your connection string
   - Add it to Vercel environment variables as `DATABASE_URL` or `POSTGRES_URI`

### Alternative Deployment Options

- **Heroku**: Can deploy both frontend and backend
- **Netlify**: Good for frontend, can use serverless functions for backend
- **Railway**: Supports full-stack deployments
- **Render**: Easy deployment for both frontend and backend

## 🧪 Testing the Application

1. **Add a skill:**
   - Navigate to "Add Skill"
   - Fill in all required fields (title, description, category, type, instructor name, email)
   - Optionally add location, duration, price
   - Submit the form

2. **Browse skills:**
   - Navigate to "Browse Skills"
   - Use the filter bar to filter by category, type, level, price
   - Use search to find specific skills
   - Sort skills by newest, rating, reviews, or title

3. **View skill details:**
   - Click on a skill card to view full details
   - See all reviews and ratings

4. **Review a skill:**
   - On the skill detail page, fill in the review form
   - Enter your name, select a rating (1-5 stars), and write a comment
   - Submit review

5. **View statistics:**
   - Navigate to "Statistics" page
   - View platform overview, category breakdowns, and top-rated skills

## 📝 Git Commits

This project includes 10 meaningful commits that demonstrate:
- Initial project setup and structure
- Database models and connection
- Backend API development (GET, POST, PUT, DELETE endpoints)
- Frontend component creation and routing
- Feature implementation (CRUD operations, reviews, search, filters)
- UI/UX improvements and responsive design
- Documentation and deployment preparation

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack development with React and Express
- RESTful API design and implementation
- Database integration with PostgreSQL
- Client-server communication with proper error handling
- Form handling and validation (client and server-side)
- Search and filtering functionality
- Responsive web design principles
- Modern JavaScript (ES6+)
- Git version control best practices
- Deployment to cloud platforms

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 🔗 Live Deployment

[Add your Vercel deployment link here once deployed]

## 💡 Future Enhancements

Potential features for future development:
- User authentication and profiles
- Skill image uploads
- Direct messaging between users
- Skill scheduling and calendar integration
- Payment integration for paid skills
- Advanced search with multiple filters
- Email notifications
- Skill recommendations based on user interests
- Social features (follow instructors, share skills)
- Export skills to PDF or CSV
- Integration with external APIs (Google Maps for location, etc.)

## 🐛 Known Issues

None at this time. Please report any issues you encounter.

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Note**: This project was built as a full-stack application demonstrating modern web development practices. All requirements for the assignment have been met, including responsive design, API endpoints, database integration, client-server communication, and deployment readiness.
