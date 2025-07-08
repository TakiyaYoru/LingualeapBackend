# 🚀 LinguaLeap Backend

English Learning App Backend built with Node.js, GraphQL, and MongoDB.

## 🎯 Features

- **Authentication System** - JWT-based user management
- **Course Management** - Hierarchical learning content (Course → Unit → Lesson → Exercise)
- **Gamification** - XP, hearts, streaks, achievements
- **Premium System** - Free/Premium content access
- **Progress Tracking** - User learning analytics
- **GraphQL API** - Modern API with type safety

## 🏗️ Tech Stack

- **Backend**: Node.js + Express
- **API**: GraphQL (GraphQL Yoga)
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel
- **File Storage**: Firebase (planned)

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

### Environment Variables

```bash
PORT=4001
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## 📊 API Endpoints

- **GraphQL Playground**: `/graphql`
- **Health Check**: `/health`

### Sample Queries

```graphql
# Get all courses
query {
  courses {
    id
    title
    level
    category
    totalLessons
  }
}

# Get course units
query {
  courseUnits(courseId: "COURSE_ID") {
    id
    title
    theme
    totalLessons
    isUnlocked
  }
}

# Register user
mutation {
  register(input: {
    username: "testuser"
    email: "test@example.com"
    password: "password123"
    displayName: "Test User"
  }) {
    token
    user {
      id
      username
      currentLevel
      totalXP
    }
  }
}
```

## 🗂️ Project Structure

```
LinguaLeap-Backend/
├── server/
│   ├── index.js              # Main server
│   ├── config.js             # Database config
│   ├── data/
│   │   ├── models/           # Mongoose models
│   │   └── mongoRepo.js      # Repository pattern
│   ├── graphql/              # GraphQL resolvers
│   │   ├── authentication.js
│   │   └── courses.js
│   └── utils/                # Utilities
│       └── auth.js           # JWT utilities
├── vercel.json               # Vercel config
└── package.json
```

## 🌱 Sample Data

The backend includes sample data:
- 1 Course: "English for Beginners" (A1 level)
- 2 Units: Greetings & Numbers  
- 2 Lessons: Basic vocabulary and introductions
- 2 Exercises: Multiple choice and fill-in-the-blank

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📈 Learning System

- **Courses** organized by CEFR levels (A1-C2)
- **Units** grouped by themes (daily life, family, etc.)
- **Lessons** with vocabulary and grammar focus
- **Exercises** with multiple types (multiple choice, fill blank, listening, etc.)
- **Progress tracking** with XP, hearts, and streaks

## 🚀 Deployment

Deployed on Vercel: [https://your-app.vercel.app](https://your-app.vercel.app)

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ for English learners worldwide