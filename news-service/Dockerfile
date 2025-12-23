FROM node:18-alpine

WORKDIR /app

COPY news-service/package*.json ./
RUN npm install --production

COPY news-service/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3003

CMD ["node", "src/app.js"]
