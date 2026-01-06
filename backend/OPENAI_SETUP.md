# OpenAI API Configuration

## Setup Instructions

### 1. Environment Variable (Recommended)

Create a `.env` file in the `backend` directory and add:

```
OPENAI_API_KEY=your_openai_key_here
```

### 2. Fallback Configuration

If no environment variable is set, the API key is hardcoded as a fallback in `backend/src/services/ai-service.js`.

**Note**: For production, always use environment variables and never commit API keys to version control.

## API Model

The system uses **GPT-4o** model for vision analysis, which provides:
- Excellent image understanding
- High accuracy in disease detection
- Professional analysis and recommendations
- JSON response format for reliable parsing

## Features

- ✅ Multiple image support (1-5 images)
- ✅ Category-specific analysis (crops, livestock, fishery)
- ✅ Professional diagnostic prompts
- ✅ Structured JSON responses
- ✅ Confidence scoring
- ✅ Severity assessment (0-10 scale)
- ✅ Actionable recommendations

## Testing

To test the integration:
1. Ensure your backend is running
2. Upload agricultural images through the frontend
3. Check console logs for API responses
4. Verify results are displayed correctly

