# --- 第一阶段：构建 (Builder) ---
FROM node:20-alpine AS builder

WORKDIR /app

# 建议：如果 npm ci 在服务器上也很慢，可以尝试设置 npm 镜像源
# RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- 第二阶段：运行 (Runner) ---
FROM nginx:1.27-alpine AS runner

# 确保你的项目目录下确实有一个 nginx.conf 文件，否则这一行会报错
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 将构建出的静态文件拷贝到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
