#### Stage BASE ########################################################################################################
FROM node:20.8.0 AS base

# Install tools, create app dir, add user and set rights
RUN set -ex && \
    mkdir -p /app && \
    deluser --remove-home node && \
    useradd --home-dir /app --no-create-home node-app --uid 1000 && \
    chown -R root:node-app /app

# Set work directory
WORKDIR /app

# copy package.json and lock file
COPY package*.json ./

# reduce permissions to readonly
RUN chgrp -R node-app /app && \
    chmod 750 /app && \
    chmod 640 /app/package*.json

#### Stage BUILD #######################################################################################################
FROM base AS build

# allow npm to create node_modules directory
RUN chmod g+w /app

# change to app user
USER node-app

# Install Build tools
RUN npm ci --no-update-notifier --only=production

#### Stage RELEASE #####################################################################################################
FROM base AS RELEASE

# stricter mode
ENV NODE_OPTIONS="--unhandled-rejections=strict"

# copy modules and sources
COPY --from=build /app/node_modules ./node_modules
COPY . .

# Chown & Clean up
RUN chown -R root:node-app /app && \
    chmod -R go-w /app && \
    chmod g+w /app/pids /app/log /app/uploads/files /app/uploads/tmp /app/public && \
    rm -rf /tmp/*

# change to app user
USER node-app

EXPOSE 5000

VOLUME /app/uploads/files /app/public

ENTRYPOINT ["npm"]
CMD ["start"]
