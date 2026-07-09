FROM oven/bun:1 AS build

WORKDIR /app
COPY package.json ./
RUN bun install --ignore-scripts && bun scripts/patch-riffy.js

FROM oven/bun:1-slim

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .

ENV RENDER=true
ENV NODE_ENV=production

EXPOSE 5000

CMD ["bun", "index.js"]
