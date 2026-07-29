# Dùng image Node.js gọn nhẹ
FROM node:18-alpine

WORKDIR /app

# Copy package.json và cài thư viện trước để tối ưu cache
COPY package*.json ./
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Port mà ứng dụng NodeJs chạy
EXPOSE 5000

# Lệnh để khởi chạy backend
CMD ["npm", "start"]