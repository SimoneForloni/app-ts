FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install
COPY . .
RUN chmod +x start.sh
EXPOSE 3000
CMD ["./start.sh"]