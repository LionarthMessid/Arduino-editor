# Arduino Code Editor

## Windows Setup Instructions

This project has been modified to run on Windows. Follow these steps to set up and run the application:

### Prerequisites

1. **Node.js**: Make sure you have Node.js installed on your Windows machine.
2. **Python**: Python 3.7+ is required for the backend.
3. **MongoDB**: Install and run MongoDB on your local machine.

### Setup

1. **Arduino CLI**: The Windows version of Arduino CLI has been included in the `bin` directory.

2. **Backend Setup**:
   - The backend uses FastAPI and connects to a local MongoDB instance.
   - The `.env` file in the backend directory is configured to connect to a local MongoDB instance.

3. **Frontend Setup**:
   - The frontend is a React application that connects to the backend.
   - The `.env` file in the frontend directory has been updated to connect to the local backend.

### Running the Application

1. **Start the Backend**:
   - Double-click the `start_backend.bat` file or run it from the command line.
   - This will install the required Python packages and start the backend server.
   - The backend will be available at http://localhost:8000.

2. **Start the Frontend**:
   - Double-click the `start_frontend.bat` file or run it from the command line.
   - This will install the required Node.js packages and start the frontend development server.
   - The frontend will be available at http://localhost:3000.

3. **Using the Application**:
   - Open your browser and navigate to http://localhost:3000.
   - You should see the Arduino Code Editor interface.
   - You can now write, compile, and upload Arduino code, manage libraries, and monitor serial output.

### Troubleshooting

- If you encounter any issues with the Arduino CLI, make sure the `bin` directory contains the `arduino-cli.exe` file.
- If the backend fails to start, check that MongoDB is running on your local machine.
- If the frontend fails to connect to the backend, check that the backend is running and the `.env` file in the frontend directory has the correct URL.