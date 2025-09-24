#!/bin/bash

# Install backend dependencies
npm install express mongoose socket.io nodemailer axios cheerio cors dotenv

# Install development dependencies
npm install --save-dev nodemon jest

echo "Backend dependencies installed successfully!"