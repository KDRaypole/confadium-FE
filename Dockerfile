# syntax=docker/dockerfile:1

# ── Stage 1: Build ───────────────────────────────────────
FROM node:20-slim AS build

RUN apt-get update -qq && apt-get install --no-install-recommends -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Production runtime ─────────────────────────
FROM node:20-slim

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start"]
