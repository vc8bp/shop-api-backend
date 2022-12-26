FROM node:9-slim
WORKDIR /app
COPY pakage.json /app
RUN npm install
COPY . /app
CMD ["npm", "run", "dev"]
EXPOSE 4000
