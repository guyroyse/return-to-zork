# syntax=docker/dockerfile:1

# Source arrives via the bind mount in docker-compose.yaml.
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
EXPOSE 5173
CMD ["npm", "run", "dev"]
