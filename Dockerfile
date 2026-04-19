FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
   MALLOC_ARENA_MAX=2

RUN apt-get update -y && \
   apt-get install -y --no-install-recommends \
      ffmpeg \
      build-essential \
   && rm -rf /var/lib/apt/lists/*

RUN corepack enable && \
   corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY . .

CMD ["node", "--max-old-space-size=300", "--expose-gc", "index.js"]