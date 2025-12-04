# Use an official Node runtime as the base image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if you have one)
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js app
ENV NODE_ENV=${NODE_ENV}

RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3002

# Start the application
CMD ["pnpm", "start"]
