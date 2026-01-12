# QuickChat 💬

A real-time chat application built with the **MERN stack** and **Socket.IO** that allows users to exchange text, images, audio, and video in real time.

---

## 🚀 Features

- 🔑 User Authentication (JWT-based login & signup)
- 💬 Real-time messaging with Socket.IO
- 👤 Online/Offline user status
- 📸 Share multimedia (Images, Audio, Video) via **Cloudinary**
- ✅ Message seen/unseen tracking in progress
- 🗑️ Delete messages (for me / for everyone)
- 🎨 Responsive UI with React + Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend:

- ReactJS
- Context API / Hooks
- Tailwind CSS

### Backend:

- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication

### Cloud Services:

- Cloudinary (Media storage)
- Vercel (Frontend hosting)
- Render/Railway (Backend hosting with WebSocket support)

---

## Getting Started

> ⚠️ **Important:** The free-tier Render backend sleeps after 15–20 min of inactivity.  
> If you experience connection issues, simply open [https://chat-app-backend-1mlq.onrender.com](https://chat-app-backend-1mlq.onrender.com) in a new tab to wake the server, then refresh the frontend.

### Prerequisites

- Node.js and npm installed
- A running backend server (see the server's README for instructions)

### Installation

1.  Navigate to the `client` directory:

    ```bash
    cd client
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env` file in the `client` directory (if it doesn't exist).
2.  Add the following environment variable:

    ```
    VITE_BACKEND_URL=http://localhost:5000 # Or your deployed backend URL
    ```

    - Replace `http://localhost:5000` with the actual URL of your running backend server.

### Running the Application

1.  Start the development server:

    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to the address shown in the console (usually `http://localhost:5173`).

## Building for Production

To create a production build:

```bash
npm run build
```
