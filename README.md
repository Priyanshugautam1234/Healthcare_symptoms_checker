# Healthcare Symptom Checker

A premium, AI-powered web application that helps users identify potential medical conditions based on their symptoms. Features a responsive React frontend and a Node.js backend integrated with Google Gemini AI.

## Features
- **AI-Powered Analysis**: Uses Google Gemini (`gemini-flash-latest`) for context-aware diagnosis.
- **Typo Tolerance**: Understands misspelled symptoms (e.g., "stomuch").
- **Emergency Detection**: Alerts users for critical symptoms.
- **Premium UI**: Clean, modern interface with smooth animations.

## Prerequisites
- Node.js (v18+)
- npm
- A Google Gemini API Key

## Setup & Run

You need to run the backend and frontend in **two separate terminals**.

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   - Open `.env` file.
   - Add your API Key: `LLM_API_KEY=AIza...`
4. Start the Server:
   ```bash
   npm start
   ```
   *Server runs on port 5000.*

### 2. Frontend Setup
1. Open a new terminal.
2. Ensure you are in the project root (`q:\unthinkable_assignment`).
   - If you are in the `backend` folder, type: `cd ..`
3. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
4. Install dependencies (if not done):
   ```bash
   npm install
   ```
5. Start the Development Server:
   ```bash
   npm run dev
   ```
6. Open the link shown (usually `http://localhost:5173`).

## Usage
- Enter your symptoms in the text box (e.g., "I have a headache and light sensitivity").
- Click **Analyze Symptoms**.
- View the AI-generated conditions and recommendations.
- Also you can download that report.


## Troubleshooting

### Windows PowerShell Error: "running scripts is disabled on this system"
If you see this error when running `npm run dev`, it's due to PowerShell security settings.

**Fix 1 (Recommended): Run in Command Prompt**
Use `cmd` instead of PowerShell.

**Fix 2 (PowerShell): Bypass Policy Temporarily**
Run this command in your PowerShell terminal before `npm run dev`:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Fix 3 (PowerShell): Permanent Fix**
Run this command as Administrator:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
