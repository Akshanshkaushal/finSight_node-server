FROM node:18-alpine

WORKDIR /app

COPY finance-engine/package*.json ./
RUN npm install --production

COPY finance-engine/ ./
COPY common/ ./common/
COPY common/ /common/
ENV NODE_PATH=/app:/app/node_modules:/common:/app/common

EXPOSE 3004

CMD ["node", "src/app.js"]
