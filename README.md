# 🐺 Yaris Lovt Dori - Telegram Game

Игра для Telegram Mini App, где волк Ярис ловит доры/PBN и зарабатывает биткойны.

## 🎮 Как играть

- Используйте стрелки или касание для движения волка
- Ловите золотые доры (+10 BTC)
- Избегайте бомб (-10 BTC)
- Побейте рекорд в лидербордe

## 🛠 Технологический стек

- **Frontend**: HTML5 Canvas, Telegram Web App API
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Хостинг**: vercel или собственный VPS

## 📁 Структура проекта

```
├── public/
│   ├── index.html          # Главная страница игры
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── game.js         # Основная логика игры
│       ├── player.js       # Персонаж волка
│       └── items.js        # Падающие предметы
├── backend/
│   ├── server.js           # Express сервер
│   └── database.js         # Работа с БД
└── package.json
```

## 🚀 Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск локально
npm start

# Запуск в production
npm run build
```

## 🤖 Интеграция с Telegram

1. Создайте бота через @BotFather
2. Добавьте Web App с вашим URL
3. Откройте игру через inline button

## 📊 Функции

- ✅ Реал-тайм геймплей
- ✅ Система очков в BTC
- ✅ Лидербордая таблица
- ✅ Сохранение рекордов пользователя
- ✅ Интеграция с Telegram профилем
