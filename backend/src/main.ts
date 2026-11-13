import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const hbs = require('hbs');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Налаштування роздачі завантажених файлів (статичний доступ)
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // Налаштування шаблонізатора Handlebars для MVC
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    // Хелпер для порівняння значень у шаблонах
    hbs.registerHelper('eq', (a: any, b: any) => a === b);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`\n🚀 Додаток запущено на порту: ${port}\n`);
}
bootstrap();