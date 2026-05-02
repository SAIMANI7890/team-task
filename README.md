# Team Task Manager - Full-Stack MERN Application

A comprehensive web application for team collaboration, project management, and task tracking with role-based access control.

## 🚀 Live Demo

**Deployed Application:** [Add your Railway URL here after deployment]

## 📋 Project Overview

Team Task Manager is a full-stack web application that enables teams to:
- Create and manage projects
- Assign tasks to team members
- Track task progress with status updates
- Monitor overdue tasks and completion rates
- Role-based access control (Admin/Member)

## ✨ Key Features

### Authentication & Authorization
- User signup and login with JWT authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Member)
- Protected routes and API endpoints

### Project Management
- Create projects (Admin only)
- Add team members to projects
- View projects based on user role and membership
- Update and delete projects (Admin/Owner only)

### Task Management
- Create tasks within projects
- Assign tasks to team members
- Update task status (todo, in-progress, done)
- Set due dates for tasks
- Delete tasks
- Filter tasks by project

### Dashboard
- View total tasks count
- Tasks breakdown by status (todo, in-progress, done)
- Overdue tasks tracking
- Personal assigned tasks view
- Completion rate visualization

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

## 📁 Project Structure

```
team-task-manager/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (AuthContext)
│   │   ├── pages/         # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── TasksPage.jsx
│   │   ├── services/      # API service functions
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── projects.js
│   │   │   └── tasks.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── package.json
│   └── vite.config.js
│
└── server/                # Backend Node.js application
    ├── config/
    │   └── db.js         # Database connection
    ├── controllers/      # Route controllers
    │   ├── authController.js
    │   ├── dashboardController.js
    │   ├── projectController.js
    │   └── taskController.js
    ├── middleware/       # Custom middleware
    │   ├── authMiddleware.js
    │   ├── errorMiddleware.js
    │   └── roleMiddleware.js
    ├── models/          # Mongoose models
    │   ├── User.js
    │   ├── Project.js
    │   └── Task.js
    ├── routes/          # API routes
    │   ├── authRoutes.js
    │   ├── dashboardRoutes.js
    │   ├── projectRoutes.js
    │   └── taskRoutes.js
    ├── .env.example
    ├── package.json
    └── server.js
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=your_super_secret_jwt_key_here
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```bash
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

Client will run on `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `POST /projects` - Create project (Admin only)
- `GET /projects` - Get user's projects
- `GET /projects/:id` - Get project by ID
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project (Admin only)

### Tasks
- `POST /tasks` - Create task
- `GET /tasks?project=<id>&user=<id>` - Get tasks (with filters)
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Dashboard
- `GET /dashboard` - Get dashboard statistics

## 🔐 Role-Based Access Control

### Admin Role
- Create and delete projects
- View all projects and tasks
- Assign any user to tasks
- Full CRUD operations on all resources

### Member Role
- View projects they created or are members of
- Create tasks in their projects
- Update task status and assignments within their projects
- View their assigned tasks

## 🚀 Deployment on Railway

**📖 For detailed step-by-step deployment instructions, see [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)**

### Quick Deployment Steps

1. **Push code to GitHub**
2. **Create Railway project** from GitHub repo
3. **Add environment variables:**
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=<your-mongodb-atlas-uri>`
   - `JWT_SECRET=<generate-random-secret>`
4. **Configure build command:**
   ```bash
   npm run install-server && npm run install-client && npm run build-client
   ```
5. **Set start command:**
   ```bash
   npm start
   ```
6. **Generate domain** and test your app!

For complete instructions with troubleshooting, see the [deployment guide](./RAILWAY_DEPLOYMENT_GUIDE.md).

## 🎥 Demo Video

[Add your 2-5 minute demo video link here]

**Demo should cover:**
- User signup/login
- Creating a project (as admin)
- Adding team members
- Creating and assigning tasks
- Updating task status
- Dashboard overview
- Role-based access demonstration

## 🧪 Testing the Application

### Test User Accounts

After deployment, create test accounts:

1. **Admin User:**
   - Email: admin@test.com
   - Password: admin123
   - Role: admin (manually update in database)

2. **Member User:**
   - Email: member@test.com
   - Password: member123
   - Role: member (default)

### Test Scenarios

1. **Authentication:**
   - Sign up new user
   - Login with credentials
   - Verify JWT token storage

2. **Project Management:**
   - Create project as admin
   - Add team members
   - Try to create project as member (should fail)

3. **Task Management:**
   - Create task in project
   - Assign to team member
   - Update task status
   - Filter tasks by project

4. **Dashboard:**
   - View task statistics
   - Check overdue tasks
   - Verify assigned tasks

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Verify MONGO_URI is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user has proper permissions

**JWT Authentication Error:**
- Verify JWT_SECRET is set
- Check token expiration (default: 7 days)
- Clear localStorage and login again

**CORS Issues:**
- Add CORS middleware in server.js
- Verify API URL in client

**Build Errors:**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all environment variables

## 📝 Future Enhancements

- [ ] Real-time notifications
- [ ] File attachments for tasks
- [ ] Task comments and activity log
- [ ] Email notifications for overdue tasks
- [ ] Advanced filtering and search
- [ ] Task priority levels
- [ ] Project templates
- [ ] Time tracking
- [ ] Export reports (PDF/CSV)
- [ ] Mobile responsive improvements

## 👥 Contributors

[Your Name] - Full-Stack Developer

## 📄 License

This project is created for educational purposes.

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Railway for application deployment
- React and Express communities

---

**Built with ❤️ using MERN Stack**
