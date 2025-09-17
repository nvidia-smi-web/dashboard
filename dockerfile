FROM node:23-alpine3.20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:23-alpine3.20
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/docker-entrypoint.sh ./
RUN apk add --no-cache tzdata
EXPOSE 3000
CMD ["sh", "./docker-entrypoint.sh"]
