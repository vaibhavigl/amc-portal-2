# AMC Dashboard - Technical Report

## Project Overview

The AMC (Annual Maintenance Contract) Dashboard is a comprehensive full-stack web application designed for IGL (Indraprastha Gas Limited) to efficiently manage Annual Maintenance Contracts and Purchase Orders. The system provides role-based access control, automated email notifications, and comprehensive contract lifecycle management.

### Key Objectives
- Centralized management of AMC contracts and purchase orders
- Automated email reminders for contract expiration
- Role-based access control (Admin, Manager, Owner)
- Department-wise contract segregation
- Real-time dashboard with contract statistics

## Tech Stack Breakdown

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 6.26.0
- **Icons**: Lucide React 0.344.0
- **HTTP Client**: Axios 1.6.0
- **Development**: ESLint, TypeScript ESLint

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: SQLite (via Prisma ORM)
- **ORM**: Prisma 5.6.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Email Service**: Nodemailer 6.9.7
- **Validation**: Express Validator 7.2.1
- **Security**: CORS 2.8.5, Rate Limiting
- **Scheduling**: Node Cron 3.0.3

## Folder & File Structure Summary

```
amc-management-system/
├── assets/
│   └── igl-logo.png                    # Company logo
├── prisma/
│   └── schema.prisma                   # Database schema definition
├── server/
│   ├── index.js                        # Main server entry point
│   ├── middleware/
│   │   └── auth.js                     # Authentication middleware
│   ├── routes/
│   │   ├── auth.js                     # Authentication routes
│   │   ├── contracts.js                # AMC contract routes
│   │   ├── purchaseOrders.js           # Purchase order routes
│   │   └── users.js                    # User management routes
│   ├── services/
│   │   └── emailService.js             # Email notification service
│   └── seed.js                         # Database seeding script
├── src/
│   ├── components/
│   │   ├── Auth/                       # Authentication components
│   │   ├── Contracts/                  # Contract management components
│   │   ├── Dashboard/                  # Dashboard components
│   │   ├── Layout/                     # Layout components
│   │   ├── Profile/                    # User profile components
│   │   ├── PurchaseOrders/             # Purchase order components
│   │   ├── UI/                         # Reusable UI components
│   │   └── Users/                      # User management components
│   ├── contexts/
│   │   └── AuthContext.tsx             # Authentication context
│   ├── App.tsx                         # Main React application
│   ├── main.tsx                        # React entry point
│   └── index.css                       # Global styles
├── .env.example                        # Environment variables template
├── package.json                        # Dependencies and scripts
├── tailwind.config.js                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration
└── vite.config.ts                      # Vite configuration
```

## Environment Variable Setup (.env)

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="file:./database.db"

# JWT Secret (Change in production)
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Configuration (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Environment
NODE_ENV="development"

# Optional: Frontend URL for password reset emails
FRONTEND_URL="http://localhost:5173"
```

### Email Setup Notes
- For Gmail, use App Passwords instead of regular passwords
- Enable 2-Factor Authentication on Gmail account
- Generate App Password: Google Account → Security → App passwords

## Installation & Startup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amc-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm run dev` - Start both frontend and backend concurrently
- `npm run client` - Start frontend only (Vite dev server)
- `npm run server` - Start backend only (Express server)
- `npm run build` - Build frontend for production
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Key Dependencies

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.344.0"
}
```

### Backend Dependencies
```json
{
  "@prisma/client": "^5.6.0",
  "express": "^4.18.2",
  "prisma": "^5.6.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "nodemailer": "^6.9.7",
  "node-cron": "^3.0.3",
  "cors": "^2.8.5",
  "express-rate-limit": "^8.0.1",
  "express-validator": "^7.2.1"
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.3.1",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.5.3",
  "eslint": "^9.9.1",
  "concurrently": "^8.2.2",
  "nodemon": "^3.0.1"
}
```

## Entry Points

### Frontend Entry Point
- **File**: `src/main.tsx`
- **Port**: 5173 (Vite dev server)
- **Purpose**: Renders the React application with StrictMode

### Backend Entry Point
- **File**: `server/index.js`
- **Port**: 3001 (Express server)
- **Purpose**: Initializes Express server, middleware, routes, and email scheduler

## Authentication & Role-Based Access

### Authentication Flow
1. **JWT-based authentication** with 7-day token expiration
2. **Password hashing** using bcryptjs with salt rounds
3. **Protected routes** using authentication middleware
4. **Password reset** functionality with email tokens

### User Roles & Permissions

#### ADMIN
- Full system access
- Manage all users, contracts, and purchase orders
- Access to all departments
- Can modify user roles and departments

#### MANAGER
- Department-level access
- Manage users within their department
- View and manage contracts/POs for their department
- Cannot access other departments' data

#### OWNER
- Personal access only
- Manage their own contracts and purchase orders
- Cannot access other users' data
- Cannot manage users

### Role-Based Route Protection
```javascript
// Example middleware usage
router.get('/users', authenticateToken, requireRole(['MANAGER', 'ADMIN']), getUsersHandler);
```

## Notable Features

### 1. Dashboard Analytics
- Real-time contract and PO statistics
- Expiration tracking and alerts
- Department-wise data segregation
- Quick action shortcuts

### 2. Contract Management
- Comprehensive AMC contract lifecycle
- Asset tracking with unique asset numbers
- Warranty and AMC period management
- Vendor information management

### 3. Purchase Order Management
- PO creation and tracking
- Vendor code and information management
- Validity period monitoring
- Department-wise PO assignment

### 4. Automated Email Notifications
- **Schedule**: Every Monday at 9:00 AM
- **Contract Reminders**: 6 months before AMC expiration
- **PO Reminders**: 6 months before validity expiration
- **User Preferences**: Individual email notification settings

### 5. Advanced Search & Filtering
- Multi-field search functionality
- Status-based filtering (Active, Expiring, Expired)
- Type-based filtering (Comprehensive, Non-comprehensive)
- Real-time search results

### 6. Responsive Design
- Mobile-first approach with Tailwind CSS
- Card and table view modes
- Responsive navigation and layouts
- Touch-friendly interface

### 7. Security Features
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS protection
- JWT token management
- Password reset with time-limited tokens

## Database Schema

### Core Entities
- **Users**: Authentication and role management
- **AMC Contracts**: Contract lifecycle management
- **Purchase Orders**: PO tracking and management

### Key Relationships
- Users → AMC Contracts (One-to-Many)
- Users → Purchase Orders (One-to-Many)
- Department-based data segregation

## Suggestions for Deployment and Testing

### Deployment Options

#### 1. Traditional VPS/Server Deployment
```bash
# Production build
npm run build

# Environment setup
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:port/database"

# Process management
pm2 start server/index.js --name "amc-backend"
```

#### 2. Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

#### 3. Cloud Platform Deployment
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Railway, Render, or AWS EC2
- **Database**: PostgreSQL on AWS RDS, Google Cloud SQL, or Supabase

### Database Migration for Production
```bash
# Switch from SQLite to PostgreSQL
DATABASE_URL="postgresql://user:password@host:port/database"
npm run db:migrate
npm run db:seed
```

### Testing Strategy

#### 1. Unit Testing
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Test structure
src/
├── __tests__/
│   ├── components/
│   ├── contexts/
│   └── utils/
```

#### 2. Integration Testing
- API endpoint testing with Supertest
- Database integration tests
- Authentication flow testing

#### 3. End-to-End Testing
```bash
# Install Cypress or Playwright
npm install --save-dev cypress
```

### Performance Optimization

#### Frontend
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle analysis with Vite bundle analyzer
- Service worker for caching

#### Backend
- Database query optimization
- Response caching with Redis
- API rate limiting
- Database connection pooling

### Monitoring & Logging

#### Production Monitoring
```bash
# Install monitoring tools
npm install winston morgan helmet compression
```

#### Health Checks
- Database connectivity checks
- Email service status
- API endpoint health monitoring

### Security Hardening

#### Production Security
- HTTPS enforcement
- Security headers with Helmet.js
- Environment variable validation
- Database query parameterization
- Regular dependency updates

#### Backup Strategy
- Automated database backups
- Configuration file backups
- Disaster recovery procedures

## Demo Credentials

For testing purposes, the seeded database includes:

- **Admin**: admin@igl.com / password123
- **IT Manager**: manager@igl.com / password123
- **CNG Manager**: cng.manager@igl.com / password123
- **IT Owner**: owner@igl.com / password123
- **CNG Owner**: cng.owner@igl.com / password123

## Support & Maintenance

### Regular Maintenance Tasks
- Database cleanup and optimization
- Log file rotation
- Security updates
- Email service monitoring
- Performance monitoring

### Troubleshooting Common Issues
1. **Email not sending**: Check SMTP credentials and app passwords
2. **Database connection errors**: Verify DATABASE_URL and database status
3. **Authentication issues**: Check JWT_SECRET and token expiration
4. **CORS errors**: Verify frontend/backend URL configuration

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: IGL Development Team