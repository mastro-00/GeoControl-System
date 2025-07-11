# Use an official Node.js image
FROM node:latest

# Set environment to development
ENV NODE_ENV=development

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Expose the backend port (adjust if different)
EXPOSE 5000

# Run the backend
CMD ["sh", "-c", "npm run create-root && npm run start"]