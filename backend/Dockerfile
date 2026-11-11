# Базовий образ Node.js
FROM node:20-alpine

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

# Запуск скомпільованого бекенду
CMD ["npm", "run", "start:prod"]