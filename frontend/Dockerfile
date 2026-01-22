FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Create environment file with API URL
ENV REACT_APP_API_URL=http://localhost:8000/api

# Build the application for production
# RUN npm run build
RUN ls -la && npm run build

# STAGE 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Remove default Nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy the build output from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the host
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]