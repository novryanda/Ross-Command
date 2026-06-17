# ============================================================
# Ross Command - Backend API (production image)
# ============================================================

FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache --virtual .native-build-deps python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl ca-certificates

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache wget openssl ca-certificates libstdc++ \
  && addgroup -S nestjs \
  && adduser -S nestjs -G nestjs

COPY package.json package-lock.json ./
RUN apk add --no-cache --virtual .native-build-deps python3 make g++ \
  && npm ci --omit=dev \
  && npm install prisma@6.19.0 --no-save \
  && npm cache clean --force \
  && apk del .native-build-deps

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && chown -R nestjs:nestjs /app

USER nestjs

EXPOSE 3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
