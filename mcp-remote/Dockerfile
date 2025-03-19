# Use the official Node.js image as the base image
FROM node:23

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/src/index.js"]