# Disease Detection System - Demo Application

A full-stack demo application that simulates AI-powered disease detection using image analysis.

**⚠️ IMPORTANT: This is a demo/educational project only. It uses simulated AI responses and should NOT be used for real medical diagnosis.**

## Features

- Upload exactly 2 medical images (skin samples, X-rays, leaf images, etc.)
- Simulated AI disease detection with confidence scores
- Beautiful, responsive single-page interface
- SQLite database logging of all detections
- RESTful API backend

## Tech Stack

### Backend
- **Express.js** - Web server framework
- **Multer** - File upload handling
- **SQLite3** - Database for logging detections
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## Project Structure

```
.
├── backend/
│   ├── server.js              # Express server
│   ├── package.json           # Backend dependencies
│   ├── disease_detection.db   # SQLite database (auto-generated)
│   └── uploads/               # Uploaded images (auto-generated)
├── src/
│   ├── App.tsx               # Main React component
│   ├── main.tsx              # React entry point
│   └── index.css             # Tailwind CSS
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ..
npm install
```

### 3. Start the Backend Server

```bash
cd backend
npm start
```

The backend will start on `http://localhost:3001`

### 4. Start the Frontend Development Server

In a new terminal:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. Open your browser to `http://localhost:5173`
2. Upload two images using the upload areas
3. Click "Detect Disease" button
4. View the simulated AI diagnosis result

## API Endpoints

### POST /api/detect
Upload 2 images for disease detection

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 2 image files with field name "images"

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"],
    "result": {
      "status": "healthy",
      "title": "Healthy",
      "message": "No disease detected. All samples appear normal.",
      "confidence": 95,
      "color": "green"
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET /api/history
Get recent detection history (last 10 entries)

### GET /api/health
Health check endpoint

## Database Schema

```sql
CREATE TABLE detection_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image1_name TEXT NOT NULL,
  image2_name TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Simulated AI Responses

The system randomly selects from these predefined responses:

1. **Healthy** - No disease detected (95% confidence)
2. **Possible Infection Detected** - Early signs of infection (78% confidence)
3. **High Risk Disease Identified** - Significant disease markers (88% confidence)
4. **Minor Abnormality** - Mild irregularities detected (72% confidence)
5. **Moderate Risk Detected** - Moderate disease indicators (81% confidence)

## Important Notes

- No real AI or machine learning is used
- No external AI APIs are called
- Responses are randomly selected from predefined options
- For demonstration and educational purposes only
- Not suitable for production medical use

## License

This is a demo/educational project. Use at your own discretion.
