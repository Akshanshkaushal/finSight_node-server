FROM node:18-alpine

WORKDIR /app

COPY payment-service/package*.json ./
RUN npm install --production

COPY payment-service/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3008

CMD ["node", "src/app.js"]
