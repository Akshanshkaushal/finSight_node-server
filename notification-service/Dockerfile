FROM node:18-alpine

WORKDIR /app

COPY notification-service/package*.json ./
RUN npm install --production

COPY notification-service/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3006

CMD ["node", "src/app.js"]
