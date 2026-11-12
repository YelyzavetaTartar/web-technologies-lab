# Базовий образ Node.js на базі Alpine
FROM node:20-alpine

# Встановлюємо OpenSSL та системні бібліотеки для Prisma
RUN apk add --no-cache openssl libc6-compat

# Робоча папка всередині контейнера
WORKDIR /app

# Копіюємо конфігураційні файли залежностей
COPY package*.json ./
COPY prisma ./prisma/

# Встановлюємо залежності та генеруємо клієнт Prisma
RUN npm install
RUN npx prisma generate

# Копіюємо решту файлів проєкту
COPY . .

# Збираємо проєкт TypeScript
RUN npm run build

# Відкриваємо порт 3000
EXPOSE 3000

# Автоматично накатуємо міграції та запускаємо сервер
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]