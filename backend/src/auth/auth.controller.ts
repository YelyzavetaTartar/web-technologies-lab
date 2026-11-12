import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Req,
    HttpStatus,
    HttpCode,
    BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Реєстрація користувача
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body()
        body: {
            email: string;
            password: string;
            name?: string;
            organizationId: number;
            isPremium?: boolean;
        },
    ) {
        if (!body.email || !body.password || !body.organizationId) {
            throw new BadRequestException("Поля 'email', 'password' та 'organizationId' обов'язкові");
        }
        return this.authService.register(body);
    }

    // Вхід і отримання токену
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: { email: string; password: string }) {
        if (!body.email || !body.password) {
            throw new BadRequestException("Поля 'email' та 'password' обов'язкові");
        }
        return this.authService.login(body.email, body.password);
    }

    // OAuth2 вхід (Google / Microsoft)
    @Post('oauth')
    @HttpCode(HttpStatus.OK)
    async oauthLogin(
        @Body()
        body: {
            email: string;
            name?: string;
            provider: string;
            organizationId: number;
        },
    ) {
        if (!body.email || !body.provider || !body.organizationId) {
            throw new BadRequestException("Поля 'email', 'provider' та 'organizationId' обов'язкові");
        }
        return this.authService.oauthLogin(body);
    }

    // Отримання профілю поточного користувача за токеном
    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Req() req: any) {
        return req.user;
    }
}