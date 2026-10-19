FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION

USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
