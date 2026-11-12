import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { ApiController } from './api.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        // Вимога B9: кешування відповідей у пам'яті (TTL: 30 секунд)
        CacheModule.register({
            ttl: 30000,
            isGlobal: true,
        }),
        AuthModule,
    ],
    controllers: [AppController, ApiController],
    providers: [AppService, PrismaService],
})
export class AppModule { }