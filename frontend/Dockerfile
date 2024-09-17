# frontend/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm install

# Copy the source code
COPY . .

# Build the React app
RUN npm run build

# Expose port 5173 to the Docker network
EXPOSE 5173

# Run the app
CMD ["npm", "run", "dev", "--", "--host"]
