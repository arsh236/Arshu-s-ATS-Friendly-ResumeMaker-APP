# ATS-Friendly Resume Builder

A powerful, static web application to build and export ATS-friendly resumes.

## Features
- **Real-time Preview**: See your resume change as you type.
- **ATS Optimized**: 
  - Standard fonts and layout.
  - Text-based PDF export (via Browser Print).
  - Proper heading hierarchy.
- **Privacy Focused**: Everything runs locally in your browser. No data is sent to any server.
- **Customizable**: Add multiple experience and education entries.

## How to Use
1. Open `index.html` in any modern web browser.
2. Fill in your details in the sidebar.
3. Click **Download PDF** (or press `Ctrl + P` / `Cmd + P`).
4. **Important**: In the Print Dialog:
   - Set **Destination** to "Save as PDF".
   - Ensure **Background Graphics** is checked (optional, but good for separators).
   - Ensure **Margins** are set to "None" or "Default" (The app handles margins).
5. Save your file.

## Tech Stack
- HTML5
- CSS3 (Vanilla)
- JavaScript (Vanilla)
- FontAwesome (Icons)
- Google Fonts (Inter, Merriweather)
