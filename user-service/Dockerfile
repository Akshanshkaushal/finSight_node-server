FROM node:18-alpine

WORKDIR /app

COPY user-service/package*.json ./
RUN npm install --production

COPY user-service/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3002

CMD ["node", "src/app.js"]
