FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Đổi port thành 5173
EXPOSE 5173

# Thêm -- --host để Vite lắng nghe kết nối từ bên ngoài container
CMD ["npm", "run", "dev", "--", "--host"]