# Dockerfile opcional (Render detecta Node sin Docker, pero sirve como alternativa)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p uploads data
ENV PORT=3001
EXPOSE 3001
CMD ["npm", "start"]
