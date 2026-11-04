import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApiController } from './api.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Module({
    imports: [],
    controllers: [AppController, ApiController],
    providers: [AppService, PrismaService],
})
export class AppModule { }