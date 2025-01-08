# frontend/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm install

# Copy the source code
COPY . .

# Expose port 3000 to the Docker network
EXPOSE 3000

# Run the app
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]
