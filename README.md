# Modern Web Programming Lab - Experiment No: 8

## Title
**Implement User Authentication using JWT and Form-Based Login**

## Aim
To implement secure user authentication in a full-stack web application using form-based login and JSON Web Token (JWT), enabling users to register, log in, and securely access protected resources.

---

## Technology Stack
- **Frontend**: React.js (Vite)
- **Backend**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`)
- **Password Security**: Hashing with `bcryptjs`
- **Styling**: Vanilla CSS (Responsive & Modern)

---

## Project Structure
```text
MWP/
├── backend/
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── models/
│   │   └── User.js            # Mongoose User schema (hashed password)
│   ├── .env                   # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example           # Example configuration
│   ├── package.json           # Backend dependencies and scripts
│   └── server.js              # Express server and authentication routes
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.css            # Clean, modern UI styling
    │   ├── App.jsx            # React component (Login, Register, Dashboard)
    │   └── main.jsx           # React DOM entry point
    ├── index.html             # HTML entry point
    ├── package.json           # Frontend dependencies and scripts
    └── vite.config.js         # Vite configuration (Port 3000)
```

---

## Step-by-Step Execution Guide (Windows & VS Code)

### Step 1: Open Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File** -> **Open Folder...** and select `MWP`.
3. Open two integrated terminals in VS Code (`Ctrl + ` `~` or **Terminal** -> **New Terminal**):
   - **Terminal 1**: Backend
   - **Terminal 2**: Frontend

---

### Step 2: Start MongoDB
Ensure MongoDB is running on your machine:
- **Local MongoDB**: Ensure the MongoDB service is running (default port `27017`).
- Or open Command Prompt as Administrator and run:
  ```powershell
  net start MongoDB
  ```
- **MongoDB Atlas (Cloud Alternative)**: If using Atlas, replace `MONGO_URI` in `backend/.env` with your connection string:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mwp_lab_auth
  ```

---

### Step 3: Run the Backend Server
In **Terminal 1**:
```powershell
cd backend
npm start
```
You should see:
```text
🚀 Backend server is running on http://localhost:5000
✅ Connected to MongoDB successfully!
```

---

### Step 4: Run the Frontend (Vite + React)
In **Terminal 2**:
```powershell
cd frontend
npm run dev
```
You will see:
```text
  VITE v5.2.8  ready in ... ms

  ➜  Local:   http://localhost:3000/
```

---

### Step 5: Test the Application in the Browser
Open your browser and navigate to:
**`http://localhost:3000`**

1. **User Registration**:
   - Click the **Register** tab.
   - Enter a new username (e.g., `student1`) and password (e.g., `pass123`).
   - Click **Register Account**.
   - A success message appears: *"Registration successful! You can now log in."*
   - The form automatically switches to the **Login** tab.

2. **User Login**:
   - In the **Login** tab, enter the registered credentials (`student1` and `pass123`).
   - Click **Login with JWT**.
   - On success, the backend returns a signed **JWT token**.
   - The token is saved in React memory, and you are redirected to the **Protected Dashboard**.

3. **Protected Dashboard**:
   - The dashboard displays **"Welcome, student1!"**.
   - It automatically calls the protected endpoint `GET /api/dashboard` sending the header:
     `Authorization: Bearer <your_jwt_token>`
   - The verified user data and timestamp are displayed.
   - You can inspect the actual JWT token payload right on the screen.

4. **Invalid Credentials Test**:
   - Log out, then try logging in with the wrong password.
   - An error alert appears: *"Invalid username or password."*

5. **Logout**:
   - Click the red **Logout** button.
   - The JWT token is cleared from React memory.
   - You are safely returned to the Login screen.
