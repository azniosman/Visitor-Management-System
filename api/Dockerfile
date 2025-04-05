FROM node:18-alpine as base

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# ---- Build/Test Stage ----
FROM base as build

# Install all dependencies including devDependencies
RUN npm ci

# Copy source code
COPY . .

# Run tests
RUN npm test

# ---- Production Stage ----
FROM base as production

# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "src/index.js"]
