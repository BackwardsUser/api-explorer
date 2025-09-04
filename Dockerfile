FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# Eventually these should be included in the tsc build process
COPY --from=build /app/src/data ./dist/data
COPY --from=build /app/src/view ./dist/view

EXPOSE 2989

CMD ["node", "dist/index.js"]
