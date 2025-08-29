# Chat Application

A full-stack chat application built using the MERN stack (MongoDB, Express.js, React, Node.js) with Socket.IO for real-time communication.

## Features

*   **Real-time Messaging:** Send and receive messages instantly.
*   **User Authentication:** Secure signup and login functionality.
*   **Profile Management:**  Users can update their profile information, including profile picture and bio.
*   **Online Status:** See which users are currently online.
*   **Image Sharing:** Share images within chats.

## Technologies Used

*   **Frontend:**
    *   React
    *   Vite
    *   React Router
    *   Axios
    *   Socket.IO Client
    *   Tailwind CSS
*   **Backend:**
    *   Node.js
    *   Express.js
    *   MongoDB
    *   Mongoose
    *   Socket.IO
    *   JWT (JSON Web Tokens)
    *   bcryptjs
    *   Cloudinary

## Getting Started

### Prerequisites

*   Node.js and npm installed
*   MongoDB database
*   Cloudinary account (for image storage)

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd chat-app
    ```

2.  Install server dependencies:

    ```bash
    cd server
    npm install
    ```

3.  Configure the server:

    *   Create a `.env` file in the `server` directory.
    *   Add the following environment variables, replacing the values with your actual configuration:

        ```
        PORT=5000
        MONGODB_URI=<your_mongodb_connection_string>
        CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
        CLOUDINARY_API_KEY=<your_cloudinary_api_key>
        CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
        JWT_SECRET=<your_jwt_secret>
        ```

4.  Install client dependencies:

    ```bash
    cd ../client
    npm install
    ```

5.  Configure the client:

    *   Create a `.env` file in the `client` directory.
    *   Add the following environment variable:

        ```
        VITE_BACKEND_URL=http://localhost:5000 # Or your deployed backend URL
        ```

### Running the Application

1.  Start the backend server:

    ```bash
    cd server
    npm run dev
    ```

2.  Start the frontend development server:

    ```bash
    cd ../client
    npm run dev
    ```

The application should now be