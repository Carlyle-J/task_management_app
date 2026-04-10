# Task Management App

A full-stack todo list application where users can create, manage, and track 
their daily tasks.

## What the app does
- Users can sign up and log in securely
- Add tasks with due dates and see how many days are left
- Mark tasks as complete, delete them, or drag and drop to reorder them
- Filter tasks by All, Active, or Completed
- Toggle between light and dark mode
- Admins can view all users, see stats, and manage user roles

## Technologies Used

**Frontend**
- Next.js
- TypeScript
- Javascript
- CSS 

**Backend**
- Node.js
- Next.js API Routes — handles all REST API requests (GET, POST, PATCH, DELETE)
- JWT
- Bcrypt

**Database**
- MongoDB
  
**Tools**
- Postman

## Login Credentials (for testing)
- Username: `User`
- Password: `12345`

## How to run locally
1. Clone the repository
2. Run `npm install`
3. Create a `.env.local` file with your MongoDB URI and JWT secret
4. Run `npm run dev`
5. Open `http://localhost:3000`
