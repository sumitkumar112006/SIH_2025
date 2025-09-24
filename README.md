# KMRL Document Management System

A comprehensive web-based document management system built with HTML, CSS, and JavaScript. This system provides role-based access control, document upload and management, analytics, and automation features for modern organizations.

## 🚀 Features

### Core Functionality
- **Role-Based Authentication**: Admin, Manager, and Staff roles with different permissions
- **Document Upload**: Drag-and-drop file upload with progress tracking
- **Document Management**: Search, filter, and organize documents efficiently
- **Analytics Dashboard**: Visual insights and reporting with Chart.js
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Automation**: Streamlined workflows and intelligent processing

### User Roles & Permissions

#### Admin Users
- Full system access and management
- User management and configuration
- System analytics and reporting
- All document operations

#### Manager Users
- Document approval workflows
- Team document management
- Analytics and reporting
- Upload and organize documents

#### Staff Users
- Document upload and download
- Personal document management
- Basic search and filtering
- View assigned documents

## 🏗️ Enhanced Tender Tracking System

This system has been enhanced with a backend architecture for automated tender tracking and notification capabilities.

### New Features
- **Automated Portal Monitoring**: Scans government and private tender portals
- **Real-time Notifications**: WebSocket-based instant alerts
- **Workflow Automation**: Streamlined tender processing and categorization
- **Document Intelligence**: Advanced document analysis and categorization
- **Email Notifications**: SMTP-based email alerts
- **Data Persistence**: MongoDB database storage
- **RESTful API**: Backend services for frontend integration

## 📁 Project Structure

```
KMRL2/
├── css/
│   └── styles.css              # Main stylesheet with KMRL branding
├── js/
│   ├── common.js               # Shared utilities and authentication
│   ├── login.js                # Authentication and login logic
│   ├── dashboard.js            # Dashboard functionality and widgets
│   ├── upload.js               # File upload handling
│   ├── documents.js            # Document management
│   ├── api-client.js           # API client for backend communication
│   ├── automation.js           # Workflow automation system
│   └── ...                     # Other JavaScript files
├── models/                     # Mongoose models for MongoDB
├── services/                   # Backend services
├── images/                     # Static assets directory
├── index.html                  # Welcome landing page
├── login.html                  # Authentication page
├── dashboard.html              # Main dashboard
├── upload.html                 # Document upload interface
├── documents.html              # Document management
├── analytics.html              # Analytics and reporting
├── admin.html                  # Admin panel

├── server.js                   # Main backend server
├── README.md                   # This file
└── README_BACKEND.md           # Backend architecture documentation
```

## 🛠️ Installation & Setup

### Quick Start
1. Clone or download the project files
2. Ensure all files are in the correct directory structure
3. Open `index.html` in a web browser
4. Navigate to the login page and use demo credentials

### Backend Setup
1. Install MongoDB locally or use a cloud service
2. Install Node.js dependencies:
   ```bash
   # On Windows
   install-backend.bat
   
   # On macOS/Linux
   chmod +x install-backend.sh
   ./install-backend.sh
   ```
3. Configure environment variables in `.env`:
   - MongoDB connection string
   - SMTP settings for email notifications
4. Start the backend server:
   ```bash
   npm start
   ```

### Local Development Server
For best experience, serve the files through a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🔐 Demo Credentials

The system includes demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kmrl.com | admin123 |
| Manager | manager@kmrl.com | manager123 |
| Staff | staff@kmrl.com | staff123 |

## 📖 Usage Guide

### Getting Started
1. **Access the System**: Open `index.html` in a web browser
2. **Login**: Click "Get Started" and use demo credentials
3. **Dashboard**: View system overview and quick statistics
4. **Navigation**: Use the sidebar to access different features

### Document Upload
1. Navigate to "Upload Documents" from the sidebar
2. Drag and drop files or click to browse
3. Fill in document metadata (title, category, description)
4. Submit for upload and processing

### Document Management
1. Go to "My Documents" section
2. Use search and filter options to find documents
3. View, download, or manage document permissions
4. Approve/reject documents (Manager/Admin roles)

### Analytics & Reporting
1. Access "Analytics" from the sidebar
2. View interactive charts and KPIs
3. Filter data by date ranges and categories
4. Export reports in various formats

### Admin Panel (Admin Only)
1. Navigate to "Admin Panel"
2. Manage user accounts and permissions
3. Configure system settings
4. Monitor system health and usage

### Tender Tracking (Enhanced Features)
1. The system automatically monitors tender portals
2. Real-time notifications appear in the dashboard
3. Email alerts are sent for high-priority tenders
4. Enhanced tender summaries and automated categorization
5. Historical tender data stored in MongoDB

## 🎨 Design System

### Brand Colors
- **Primary Blue**: #2563eb (KMRL brand color)
- **Success Green**: #059669
- **Warning Orange**: #d97706
- **Danger Red**: #dc2626
- **Neutral Grays**: #f8fafc to #0f172a

### Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Responsive Sizing**: 14px base on mobile, 16px on desktop
- **Weight Hierarchy**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Layout Principles
- **Mobile-First**: Responsive design starting from 320px width
- **Grid System**: CSS Grid and Flexbox for layouts
- **Spacing**: Consistent 8px spacing scale
- **Border Radius**: 4px to 16px for different elements

## 🔧 Technical Specifications

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: ES6+, CSS Grid, Flexbox, Local Storage

### Dependencies
- **Frontend**: Chart.js, Font Awesome
- **Backend**: Express, Mongoose, Socket.IO, Nodemailer
- **Development**: Nodemon, Jest
- **Web Scraping**: Axios, Cheerio

### Performance
- **Optimized Assets**: Minified CSS, efficient JavaScript
- **Lazy Loading**: Images and components loaded as needed
- **Database Storage**: MongoDB for persistent data
- **Fast Interactions**: Smooth animations and micro-interactions

## 🚀 Key Features Explained

### Authentication System
- **Session Management**: Browser local storage
- **Role-Based Access**: Dynamic UI based on user permissions
- **Security**: Input validation and sanitization
- **Demo Mode**: Pre-configured test accounts

### Document Processing
- **File Upload**: HTML5 File API with progress tracking
- **Validation**: File type, size, and content checks
- **Metadata**: Automatic and manual document tagging
- **Storage Simulation**: Local storage for demo purposes

### User Interface
- **Responsive Design**: Mobile-first, adaptive layouts
- **Dark/Light Themes**: KMRL brand color system
- **Accessibility**: Keyboard navigation, screen reader support
- **Animations**: Smooth transitions and micro-interactions

### Analytics Engine
- **Real-Time Data**: Dynamic chart updates
- **Multiple Views**: Charts, tables, and summary cards
- **Export Options**: PDF, Excel, and image formats
- **Filtering**: Date ranges, categories, and user groups

### Tender Tracking Engine
- **Portal Monitoring**: Automated scanning of tender portals
- **Real-time Notifications**: Instant alerts via WebSockets
- **Workflow Enhancement**: Intelligent tender processing
- **Email Alerts**: SMTP-based notification system
- **Data Persistence**: MongoDB database storage

## 🔒 Security Features

### Data Protection
- **Input Sanitization**: XSS prevention
- **Content Security**: File type validation
- **Session Security**: Automatic timeout and validation
- **Role Enforcement**: Server-side permission checks (simulated)

### Best Practices
- **Password Requirements**: Enforced complexity rules
- **Session Management**: Secure token handling
- **Error Handling**: User-friendly error messages

## 📚 Additional Documentation

For detailed information about the backend architecture, see:
- [README_BACKEND.md](README_BACKEND.md) - Backend architecture documentation
- [SYSTEM_INTEGRATION_GUIDE.md](SYSTEM_INTEGRATION_GUIDE.md) - Integration guide
- [SYSTEM_VALIDATION_GUIDE.md](SYSTEM_VALIDATION_GUIDE.md) - Validation guide