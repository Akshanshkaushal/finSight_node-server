FROM node:18-alpine

WORKDIR /app

COPY api-gateway/package*.json ./
RUN npm install --production

COPY api-gateway/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3000

CMD ["node", "src/app.js"]

