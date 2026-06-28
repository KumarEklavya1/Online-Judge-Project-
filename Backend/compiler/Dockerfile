FROM node:20-bullseye
RUN apt-get update && apt-get install -y g++
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "start"]