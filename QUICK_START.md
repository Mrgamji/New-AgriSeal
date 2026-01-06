# Quick Start Guide

## Running the Disease Detection System

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

You should see:
```
🚀 Disease Detection API running on http://localhost:3001
📊 Database: /path/to/disease_detection.db
📁 Uploads: /path/to/uploads
```

### Step 2: Start the Frontend (In a New Terminal)

Open a **new terminal** and run:

```bash
npm run dev
```

The app will open at: `http://localhost:5173`

### Step 3: Use the Application

1. Upload 2 images (any image files will work for testing)
2. Click "Detect Disease"
3. View the simulated AI diagnosis

## Test Images

You can use any images for testing:
- Screenshots
- Photos from your computer
- Sample medical images from the internet
- Any PNG, JPG, or other image formats

The system will accept them and provide a simulated diagnosis result.

## Stopping the Servers

Press `Ctrl+C` in each terminal to stop the servers.

## Troubleshooting

**Backend won't start:**
- Make sure you ran `npm install` in the `backend/` folder
- Check that port 3001 is not in use

**Frontend shows connection error:**
- Make sure the backend is running on port 3001
- Check your browser console for error messages

**Can't upload images:**
- Ensure both backend and frontend are running
- Make sure you're uploading exactly 2 images
- Check that images are valid image files

## API Testing with curl

You can also test the backend directly:

```bash
curl -F "images=@image1.jpg" -F "images=@image2.jpg" http://localhost:3001/api/detect
```
