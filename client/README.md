# Client-Side Application (React + Vite)

This is the client-side application for the Chat Application, built using React and Vite.

## Technologies Used

*   React
*   Vite
*   React Router
*   Axios
*   Socket.IO Client
*   Tailwind CSS

## Getting Started

### Prerequisites

*   Node.js and npm installed
*   A running backend server (see the server's README for instructions)

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

    *   Replace `http://localhost:5000` with the actual URL of your running backend server.

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
