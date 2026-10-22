FROM node:20-bookworm

# Clean and update apt safely to avoid 404 mirror errors
RUN apt-get clean && \
    apt-get update -o Acquire::Check-Valid-Until=false && \
    apt-get install -y --no-install-recommends ffmpeg git python3 build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm cache clean --force && npm install --legacy-peer-deps --force

COPY . .

CMD ["npm", "start"]
