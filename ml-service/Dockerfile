FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY ml-service/package*.json ./
RUN npm install --production

# Copy ml-service source
COPY ml-service/src ./src

# Copy common into ml-service directory (as sibling to src)
COPY common ./common

EXPOSE 3009

CMD ["node", "src/app.js"]

