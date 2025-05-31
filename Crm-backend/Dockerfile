# Use the official Node.js 18 Alpine image as a base
FROM node:18-alpine

# Install MySQL client and wget for healthcheck
RUN apk add --no-cache mysql-client wget

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Install ts-node globally for TypeScript execution
RUN npm install -g ts-node

# Copy the rest of your application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Don't remove dev dependencies since we need ts-node for seeders
# RUN npm prune --production

# Create uploads directory
RUN mkdir -p uploads/avatars

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001 -G nodejs

# Ensure entrypoint script has correct permissions and line endings
RUN chmod +x /usr/src/app/docker-entrypoint.sh && \
    sed -i 's/\r$//' /usr/src/app/docker-entrypoint.sh

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /usr/src/app

# Expose the port your app runs on
EXPOSE 3000

USER nodejs

# Set the entrypoint
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]

# Command to run your application
CMD ["npm", "start"]
