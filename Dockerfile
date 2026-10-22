FROM node:20-bullseye

RUN apt-get update && apt-get install -y ffmpeg git python3 build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm cache clean --force && npm install --legacy-peer-deps --force

COPY . .

CMD ["npm", "start"]
