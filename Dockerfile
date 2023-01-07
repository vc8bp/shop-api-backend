FROM node:16-alpine
WORKDIR /app
FROM node:12-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
EXPOSE 4000
