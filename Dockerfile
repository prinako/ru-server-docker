# Stage 1: Build
# This stage builds the application.
# It copies the necessary files and installs the dependencies.
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install --omit=dev

# Copy the source code files
COPY /src/* ./

# Copy the DB directory
COPY /DB ./DB

# Stage 2: Final image
# This stage creates the final image with the application.
# It sets the timezone and exposes the DB volume.
FROM node:20-alpine

# Install the tzdata package
RUN apk add --no-cache tzdata

# Set the timezone environment variable
ENV TZ=America/Sao_Paulo

# Create a symbolic link to the timezone file
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Set the working directory
WORKDIR /app

# Copy the node_modules directory from the build stage
COPY --from=build /app/node_modules ./node_modules

# Copy the source code files
COPY --from=build /app ./

# Expose the DB volume
VOLUME [ "/app/DB" ]

# Set the default command to run the application
CMD [ "node", "server.js" ]
