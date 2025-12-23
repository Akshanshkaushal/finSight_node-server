FROM node:18-alpine

WORKDIR /app

COPY advisory-service/package*.json ./
RUN npm install --production

COPY advisory-service/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3005

CMD ["node", "src/app.js"]
