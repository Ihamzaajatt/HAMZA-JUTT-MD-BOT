FROM node:20-bullseye
RUN apt-get update && apt-get install -y ffmpeg imagemagick webp git
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
CMD ["npm", "start"]
