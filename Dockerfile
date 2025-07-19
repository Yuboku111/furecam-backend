FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 9000

# Start the application
CMD ["yarn", "start"]