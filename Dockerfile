FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --network-timeout 100000 || npm install --legacy-peer-deps --force

COPY . .

CMD ["npm", "start"]
