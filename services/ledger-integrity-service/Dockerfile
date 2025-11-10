FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 8013
CMD ["node", "dist/index.js"]