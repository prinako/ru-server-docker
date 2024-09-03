# Stage 1: Build
# This stage builds the application.
# It copies the necessary files and installs the dependencies.
FROM node:20-alpine AS build

LABEL org.opencontainers.image.description ru-server-new-docker

# Set the working directory
WORKDIR /app

# Copy the source code files
COPY . .

# Install the dependencies
RUN npm install --omit=dev

# Stage 2: Final image
# This stage creates the final image with the application.
# It sets the timezone and exposes the DB volume.
FROM node:20-alpine

LABEL org.opencontainers.image.description ru-server-new-docker

# Install the tzdata package
# Timezone setup (optimized)
ENV TZ=America/Sao_Paulo
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Set the working directory
WORKDIR /opt/node_app

COPY --from=build /app/node_modules ./node_modules
# Copy the source code files
COPY --from=build /app ./

# Set the default command to run the application
CMD [ "node", "/opt/node_app/src/server.js" ]
