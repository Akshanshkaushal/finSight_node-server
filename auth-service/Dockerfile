FROM node:18-alpine

WORKDIR /app

COPY auth-service/package*.json ./
RUN npm install --production

COPY auth-service/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3001

CMD ["node", "src/app.js"]
