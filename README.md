<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1D0DCeqPwhhQzD0W1L3-QvRP0udC5X0tt

## Run Locally

**Prerequisites:**  Node.js

### Installation

1. Install all dependencies (frontend and backend):
   ```bash
   npm run install:all
   ```
   
   Or manually:
   ```bash
   npm install
   cd server && npm install
   ```

2. (Optional) Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

### Running the Application

The application consists of two parts:
- **Frontend**: React app (port 3000)
- **Backend**: API server with SQLite database (port 3001)

#### Option 1: Run both separately (recommended for development)

1. Start the backend server:
   ```bash
   npm run server:dev
   ```
   The server will run on `http://localhost:3001`

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:3000`

#### Option 2: Run backend in production mode

```bash
npm run server
```

### Features

- **Automatic User ID Generation**: Each test participant gets a unique UUID automatically
- **Data Persistence**: All test data is saved to SQLite database
- **Aggregated Analysis**: Analysis dashboard shows data from all participants
- **Real-time Data Collection**: Test results are saved immediately after each phase

### Database

The SQLite database (`server/abtest.db`) is automatically created on first run. It stores:
- Test sessions with participant IDs
- Phase 1 results (reaction times, matches)
- Phase 2 results (keyword selections)
