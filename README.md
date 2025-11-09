# 📚 CampusBookEx: Peer-to-Peer Academic Exchange Platform

**CampusBookEx** is a full-stack web application designed to facilitate the **secure, real-time exchange of textbooks and study materials** among students within a specific academic campus. It moves the traditional, chaotic bulletin board system online, providing a modern, efficient, and cost-saving solution.

---

## ✨ Key Features

This project demonstrates proficiency in advanced full-stack development, real-time communication, and robust data handling.

| Feature                   | Description                                                                                                                                 | Technologies Demonstrated                                |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| **Full Authentication**   | Secure user registration, login, and token-based protection for all private endpoints.                                                      | **JWT**, **Bcrypt**, **Private Routing**                 |
| **Real-Time Messaging**   | Instant, direct, user-to-user chat functionality for accepted exchanges.                                                                    | **Socket.io**                                            |
| **Live Notifications**    | Users receive instant, live alerts (red bell icon) when a new request is made for their book, even if they are browsing a different page.   | **Socket.io**, **Zustand**                               |
| **Dynamic Search/Filter** | Filters listings by title, author, and condition.                                                                                           | **MongoDB Regex Queries**                                |
| **Secure File Uploads**   | Integrated system for uploading book cover images (and formerly PDFs) to the cloud.                                                         | **Cloudinary**, **Multer**                               |
| **Optimized UI/UX**       | Implements a clean, responsive interface using atomic design principles and custom toast notifications that slide up from the bottom right. | **Tailwind CSS**, **Framer Motion**, **React-Hot-Toast** |
| **Protected Dashboard**   | Separate user dashboard showing **Available Listings**, **Received Requests**, **Sent Requests**, and **Exchange History**.                 | **MERN Full Stack**                                      |

---

## 🛠️ Technology Stack

This project is built using a modern, complete MERN stack architecture.

### Backend & Database (API)

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud NoSQL)
- **ORM:** Mongoose
- **Real-Time:** Socket.io
- **Authentication:** JSON Web Tokens (JWT)
- **File Handling:** Multer, Cloudinary SDK

### Frontend (Client)

- **Framework:** React (Functional Components, Hooks)
- **Tooling:** Vite (Fast build and development)
- **Language:** TypeScript
- **State Management:** Zustand (Global State), TanStack Query (Server State, Caching, Data Sync)
- **Styling:** Tailwind CSS (Utility-First)
- **UI/Animation:** React Router DOM, Framer Motion

---

## ⚙️ Installation and Setup

### Prerequisites

1.  **Node.js** (v18+) and **npm** installed.
2.  **MongoDB Atlas Account** (free tier is fine).
3.  **Cloudinary Account** (free account is fine).
4.  **GitHub Account** for cloning the project.

### Step 1: Clone and Install

```bash
# 1. Clone the repository
git clone https://github.com/Sreenivasulu-Kalluru/campus-book-exchange.git
cd campus-book-exchange

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies (and handle the PWA/React 19 conflict)
cd ../frontend
npm install --legacy-peer-deps
```

### Step 2: Configure Environment Variables

Create a file named `.env` in the **`server`** directory and add your credentials:

```
# MongoDB Atlas Connection String
MONGO_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/bookExchangeDB"

# Security Secrets
JWT_SECRET="YOUR_LONG_RANDOM_SECRET"

# Cloudinary Credentials (Used for Image Uploads)
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET

# Frontend URL (For CORS and Socket.io)
FRONTEND_URL=http://localhost:5173
```

### Step 3: Run the Seeder (Optional but Recommended)

To populate your database with dummy books and images:

```bash
# 1. Back in the main 'server' directory, edit seeder.js
#    Replace 'USER_ID_1' and 'USER_ID_2' with IDs from your MongoDB 'users' collection.

# 2. Run the import script
cd ../server
npm run seeder:import
```

### Step 4: Start the Servers

1.  **Start Backend (Socket.io/API):**
    ```bash
    cd ../server
    npm run dev
    ```
2.  **Start Frontend (React):**
    ```bash
    cd ../frontend
    npm run dev
    ```

The application will be live at `http://localhost:5173`.
