# Microservices Social Media App (WIP)

A microservices-based backend system designed for a social media platform.  
Built with scalability, maintainability, and real-world production principles in mind.

---

## Services

| Service Name         | Description                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| **API Gateway**      | Acts as the single entry point (proxy) that forwards requests to services. Handles routing and authentication. |
| **Identity Service** | Handles authentication (login, signup) and user management (CRUD users).                                       |
| **Post Service**     | Handles CRUD operations for posts (create, read, update, delete).                                              |
| **Media Service**    | Handles media (images/videos) upload and deletion using Cloudinary.                                            |
| **Search Service**   | Handles searching posts based on content using MongoDB text indexes.                                           |

---

## Tech Stack

- **Node.js** — Backend runtime
- **Express.js** — Web framework
- **MongoDB + Mongoose** — Database and ODM
- **Redis** — Caching posts and search queries
- **RabbitMQ** — Messaging queue for event-driven communication
- **Cloudinary** — Cloud storage for uploaded media
- **Winston** — Logging
- **Docker** _(planned)_ — Containerization
- **Postman** — API testing
- **Nginx** _(planned)_ — Load balancing (API Gateway level)
- **JWT** — Authentication tokens

---

## Current Features

- User registration, login, and profile management
- Create, Read, Update, Delete (CRUD) Posts
- Search posts using full-text search
- Upload and delete media files (Cloudinary integration)
- API Gateway for centralized routing and authentication
- Event-driven communication (post deletion triggers media/search deletion)
- Redis caching for posts and search results
- Centralized logging with Winston

---

## Future Improvements

### Improvements to Existing Services

- **Identity Service**
  - Add Google/GitHub OAuth login
  - Email verification (on signup) and password reset flows
- **Post Service**
  - Like, comment, and share features
  - Support for reposts (similar to retweets)
  - Post privacy settings (public, friends only, private)
- **Search Service**
  - Advanced search (search by user, tags, hashtags)
  - Trending posts / popular searches

### New Services to Add

- **Notification Service**
  - Real-time notifications (new followers, likes, comments, mentions)
- **Follow Service**
  - Manage following/followers relationships
- **Feed Service**
  - Personalized feed generation based on user’s following
- **Analytics Service**
  - Track user activities and post engagement stats
- **Chat Service**
  - Real-time messaging (text, images, gifs)
- **Admin Service**
  - Admin panel to manage users, posts, reported content

---

## System Architecture (Concept)

Client App (Frontend)
↓
API Gateway (proxy requests)
↓
┌───────────────────────────────────────┐
│ Microservices │
│ ┌────────────┐ ┌─────────────┐ │
│ │ Identity │ │ Post │ │
│ │ Service │ │ Service │ │
│ └────────────┘ └─────────────┘ │
│ ┌────────────┐ ┌─────────────┐ │
│ │ Media │ │ Search │ │
│ │ Service │ │ Service │ │
│ └────────────┘ └─────────────┘ │
└───────────────────────────────────────┘
(Communicate using HTTP + RabbitMQ Events)

---

### Getting Started (Development)

## 1. Clone the repository:

- git clone https://github.com/lenlo121500/social-media-microservices.git
- cd social-media-microservices

## 2. Install dependencies:

- npm install

## 3. Setup .env files for each service

## 4. Start a service (Example for Post Service):

- cd post-service
- npm run dev

## 5. Start API Gateway:

- cd api-gateway
- npm run dev

## 6. Test endpoints using Postman or cURL

---

### Deployment (Coming soon)

- Docker Compose for local development
- Production-ready deployment guide
- Nginx setup for load balancing and SSL termination

---

### Status

- WIP (Work In Progress) — constantly improving and expanding.
  Built for learning real-world scalable backend systems and eventually evolving into a fully working social media backend.
