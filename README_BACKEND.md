# KMRL Tender Tracking System - Backend Architecture

This document describes the backend architecture for the KMRL Tender Tracking System, which enhances the existing client-side implementation with server-side capabilities.

## Architecture Overview

The backend is built with Node.js and Express, providing RESTful APIs and real-time communication through WebSockets. It uses MongoDB for data persistence.

## Technology Stack

- **Backend Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Email Notifications**: Nodemailer
- **Web Scraping**: Axios and Cheerio
- **Environment Management**: Dotenv

## Project Structure

```
KMRL2/
├── server.js              # Main server file
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
├── models/                # Mongoose models
│   ├── Tender.js
│   ├── Notification.js
│   ├── Portal.js
│   └── User.js
├── services/              # Business logic services
│   ├── scraper.js         # Web scraping service
│   └── monitor.js         # Portal monitoring service
└── js/                    # Updated frontend files
    ├── api-client.js      # API client for frontend
    └── ...                # Updated existing JS files
```

## API Endpoints

### Tenders
- `GET /api/tenders` - Retrieve all tenders
- `POST /api/tenders` - Create a new tender

### Notifications
- `GET /api/notifications` - Retrieve all notifications
- `POST /api/notifications` - Create a new notification

### Portals
- `GET /api/portals` - Retrieve all portals
- `PUT /api/portals/:id` - Update a portal

### Monitoring
- `POST /api/monitoring/start` - Start portal monitoring
- `POST /api/monitoring/stop` - Stop portal monitoring

## Real-time Features

The system uses Socket.IO for real-time communication:
- New tenders are broadcast to all connected clients
- Notifications are sent in real-time
- Portal scanning updates are streamed to clients

## Web Scraping

The scraping service:
- Periodically scans government and private tender portals
- Parses tender information
- Filters tenders based on keywords

## Email Notifications

The system can send email notifications via SMTP:
- New tender alerts
- Deadline reminders
- System status updates

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up MongoDB:
   - Install MongoDB locally or use a cloud service
   - Update the MONGODB_URI in .env

3. Configure environment variables in .env:
   - SMTP settings for email notifications
   - MongoDB connection string

4. Start the server:
   ```bash
   npm start
   ```

## Development

For development with auto-restart:
```bash
npm run dev
```

## Testing

Run tests with:
```bash
npm test
```

## Security Considerations

- Environment variables are stored in .env (not committed to version control)
- CORS is enabled for development (should be restricted in production)
- Input validation should be added to all API endpoints
- Authentication and authorization should be implemented for production use

## Future Enhancements

- Implement user authentication and role-based access control
- Add more sophisticated scraping for specific portals
- Implement data analytics and reporting
- Add mobile push notifications
- Integrate with more government and private portals