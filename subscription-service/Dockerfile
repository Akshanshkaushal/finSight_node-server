FROM node:18-alpine

WORKDIR /app

COPY subscription-service/package*.json ./
RUN npm install --production

COPY subscription-service/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3007

CMD ["node", "src/app.js"]
