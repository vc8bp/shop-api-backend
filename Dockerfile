FROM node:9-slim
WORKDIR /app
COPY pakage.json /app
RUN npm install
COPY . /app
CMD ["npm", "run", "start"]
EXPOSE 4000
