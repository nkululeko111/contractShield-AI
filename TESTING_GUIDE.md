# File Upload Functionality - Quick Test Guide

## ✅ What's Been Fixed

### Frontend Upload UI
- ✅ Shows **uploading indicator** while file is being uploaded
- ✅ Displays **file preview** (name and size) during upload
- ✅ Shows **status messages** for each stage (uploading → analyzing → complete)
- ✅ Real-time **progress bar** (0-100%)
- ✅ Better **error handling** with helpful messages

### Backend Processing
- ✅ **Extracts text** from PDF, DOCX, and images (OCR)
- ✅ **Analyzes contract** using AI
- ✅ Returns comprehensive analysis with safety score
- ✅ Proper **error messages** if extraction fails
- ✅ **Cleanup** of temporary files

## 🧪 How to Test

### Test 1: PDF Upload
```
1. Click "Upload Document"
2. Select a PDF file
3. Observe:
   - Progress bar appears
   - File name and size shown
   - Status shows "Uploading File..."
   - Then changes to "Analyzing Contract..."
   - Finally shows "Analysis Complete!"
4. Results displayed on analysis page
```

### Test 2: DOCX Upload
```
1. Click "Upload Document"
2. Select a .docx file
3. Same flow as PDF
4. Text extracted and analyzed
```

### Test 3: Image Upload (OCR)
```
1. Click "Upload Document"
2. Select a JPG/PNG image of a contract
3. OCR extracts text automatically
4. Analysis performed on extracted text
```

### Test 4: Text Input
```
1. Click "Paste Contract Text"
2. Paste contract text in modal
3. Click "Analyze"
4. Watch progress bar
5. See results when complete
```

### Test 5: Error Handling
```
1. Try uploading empty file → Should show "No readable text found"
2. Try uploading non-document file → Should show appropriate error
3. Check browser console for detailed logs
```

## 📊 Progress Stages

| Stage | Icon | Status Message | Color |
|-------|------|----------------|-------|
| Uploading | 🔄 | "Uploading File..." | Blue (#1E40AF) |
| Analyzing | 🔄 | "Analyzing Contract..." | Orange (#EA580C) |
| Complete | ✅ | "Analysis Complete!" | Green (#059669) |

## 📱 UI Components

### File Preview Card
Shows during upload:
- File icon
- File name
- File size in KB

### Status Container
Shows:
- Animated icon matching current stage
- Status title
- Helpful subtitle explaining what's happening

### Progress Bar
- Smooth animation from 0% to 100%
- Shows percentage text below
- Visual feedback on upload progress

### Modal for Text Input
- Bottom sheet style (slides up from bottom)
- Close button (X) in header
- Multi-line text input
- Cancel and Analyze buttons

## 🐛 Debugging Tips

### Check Logs
```
Frontend: Open browser DevTools → Console
Backend: Check terminal where server is running
```

### Common Issues

**Issue: File upload hangs**
- Check if backend server is running
- Verify API endpoint URL in code
- Check network tab in DevTools

**Issue: "No text extracted"**
- File may be corrupted
- Try different file format
- Image may need higher quality for OCR

**Issue: Analysis doesn't start**
- Check if AI API key is set
- Verify Groq API credentials
- Check server logs for errors

## 📋 File Sizes Supported
- **PDF**: Up to 15MB
- **DOCX**: Up to 15MB
- **Images**: Up to 15MB

## 🔐 Error Messages Guide

| Error | Cause | Solution |
|-------|-------|----------|
| "No file uploaded" | File not selected | Select a file before upload |
| "No text extracted" | File has no readable text | Use clear, readable document |
| "File may be corrupted" | PDF/DOCX is damaged | Try another file or format |
| "Failed to extract text from image" | Image quality too poor | Use clearer image or different format |
| "No readable text found" | Extracted text too short | Use longer contract text |

## 🎯 Expected Results

After successful upload:
- Safety score (0-100)
- Overview of contract
- List of specific issues/findings
- Each item has:
  - Title
  - Description
  - Severity (high/medium/low/info)
  - Detailed explanation

## 🚀 Performance Notes

- Upload progress shown immediately
- Analysis typically takes 5-30 seconds depending on file size
- Progress bar updates every 300ms
- Smooth transitions between stages
