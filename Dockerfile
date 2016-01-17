FROM node:4.2.4-slim

WORKDIR /app

COPY package.json /app/package.json
RUN npm i

COPY . /app

EXPOSE 8080

CMD ["npm", "start"]