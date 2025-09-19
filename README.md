# KMRL Document Management System

A fully functional frontend web application for Kochi Metro Rail Limited (KMRL) staff to manage documents, view analytics, and interact with AI-powered features.

## 🚀 Features

### 📋 Core Functionality
- **User Authentication**: Login with role-based access (Admin, Manager, Staff)
- **Two-Factor Authentication**: Simulated 2FA with OTP verification
- **Document Upload**: Drag-and-drop file upload with progress tracking
- **Document Management**: Search, filter, and manage documents with approval workflows
- **Analytics Dashboard**: Interactive charts and KPI visualizations
- **Role-Based Access**: Different views and permissions for each user role
- **Responsive Design**: Mobile-friendly interface that works on all devices

### 🔐 User Roles

#### Admin
- Access to all system features
- User management and system settings
- Complete document oversight
- System analytics and reports

#### Manager  
- Department document management
- Approval and rejection workflows
- Team performance analytics
- Document review capabilities

#### Staff
- Document upload and tracking
- Personal document management
- Upload status monitoring
- Basic analytics view

### 📱 Pages & Components

1. **Login Page** (`login.html`)
   - Email/password authentication
   - Role selection dropdown
   - Two-factor authentication simulation
   - Password reset functionality

2. **Dashboard** (`dashboard.html`)
   - Role-specific welcome and content
   - Interactive widgets showing key metrics
   - Quick actions and navigation
   - Real-time notifications

3. **Document Upload** (`upload.html`)
   - Drag-and-drop file interface
   - Metadata input forms
   - Progress tracking with OCR simulation
   - AI summary generation

4. **Documents List** (`documents.html`)
   - Searchable document table
   - Advanced filtering options
   - Bulk actions for document management
   - Document preview and actions

5. **Analytics** (`analytics.html`)
   - Interactive charts using Chart.js
   - KPI dashboards
   - Exportable reports
   - Department and workflow analytics

6. **Admin Panel** (`admin.html`)
   - User management interface
   - System settings configuration
   - Security and workflow controls

### 🎨 Technical Features

- **Modern CSS**: Flexbox/Grid layouts with CSS variables
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **JavaScript ES6+**: Modern JavaScript with classes and async/await
- **Chart.js Integration**: Beautiful, interactive charts and graphs
- **Local Storage**: Client-side data persistence for demo purposes
- **Font Awesome Icons**: Professional iconography throughout
- **Smooth Animations**: CSS transitions and animations for better UX

## 🚦 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for running the local server)

### Installation & Running

1. **Navigate to the project directory**:
   ```bash
   cd KMRL2
   ```

2. **Start the local server**:
   ```bash
   python -m http.server 8080
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:8080
   ```

### Demo Credentials

Use these credentials to test different user roles:

| Role    | Email               | Password   |
|---------|-------------------- |------------|
| Admin   | admin@kmrl.com      | admin123   |
| Manager | manager@kmrl.com    | manager123 |
| Staff   | staff@kmrl.com      | staff123   |

**Note**: For 2FA verification, the OTP code is displayed in the browser console during login.

## 📂 Project Structure

```
KMRL2/
├── index.html              # Welcome/landing page
├── login.html              # Authentication page
├── dashboard.html          # Main dashboard
├── upload.html             # Document upload page
├── documents.html          # Document management page
├── analytics.html          # Analytics and reports
├── admin.html              # Admin panel
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── common.js           # Shared utilities
│   ├── login.js            # Login functionality
│   ├── dashboard.js        # Dashboard features
│   ├── upload.js           # Upload handling
│   ├── documents.js        # Document management
│   └── analytics.js        # Charts and analytics
├── images/                 # Image assets
└── assets/                 # Additional assets
```

## 🎯 Key Features Demonstration

### Authentication Flow
1. Visit the landing page and click "Access System"
2. Enter demo credentials for any role
3. Complete 2FA verification (OTP shown in console)
4. Redirected to role-appropriate dashboard

### Document Upload Process
1. Navigate to Upload Document page
2. Drag and drop files or browse to select
3. Fill in document metadata (title, department, etc.)
4. Watch real-time upload progress with OCR simulation
5. Receive notifications upon completion

### Document Management
1. Visit Documents page to see all documents
2. Use search and filters to find specific documents
3. Preview documents in modal
4. Approve/reject documents (Manager/Admin only)
5. Download or perform bulk actions

### Analytics Dashboard
1. Access Analytics page to view charts
2. Change time periods to see different data
3. Export reports in CSV format
4. View department statistics and KPI metrics

## 🔧 Customization

### Adding New Features
- All JavaScript is modular and can be easily extended
- CSS uses CSS variables for easy theming
- Role-based content can be added using `.admin-only`, `.manager-only`, `.staff-only` classes

### Styling Changes
- Modify CSS variables in `styles.css` to change the color scheme
- All components use consistent naming conventions
- Responsive breakpoints are clearly defined

### Data Integration
- Replace mock data functions in `common.js` with real API calls
- Update localStorage usage with actual backend integration
- Modify authentication flow for real user management

## 🌟 Highlights

- **Fully Responsive**: Works perfectly on all screen sizes
- **Role-Based Security**: Different interfaces for different user types
- **Modern UI/UX**: Clean, professional design following modern standards
- **Interactive Elements**: Smooth animations and user feedback
- **Comprehensive Features**: Complete document management workflow
- **Production Ready**: Well-structured, maintainable code

## 📋 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Development Notes

This is a frontend demonstration application built with vanilla HTML, CSS, and JavaScript. It simulates a complete document management system with:

- Mock data for demonstration purposes
- LocalStorage for data persistence
- Simulated API calls with delays
- Role-based access control
- Complete user workflows

For production use, integrate with:
- Backend API for data management
- Real authentication system
- Database for document storage
- File upload services
- Email notification system

## 📄 License

This project is created for demonstration purposes for the KMRL Document Management System requirements.

---

**Built with ❤️ using HTML5, CSS3, and JavaScript ES6+**