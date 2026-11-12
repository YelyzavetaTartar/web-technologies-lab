import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    // 1. Звичайна реєстрація (C16)
    async register(data: {
        email: string;
        password: string;
        name?: string;
        organizationId: number;
        isPremium?: boolean;
    }) {
        // Перевіряємо, чи існує організація
        const org = await this.prisma.organization.findUnique({
            where: { id: data.organizationId },
        });
        if (!org) {
            throw new NotFoundException(`Організацію з ID ${data.organizationId} не знайдено`);
        }

        // Перевіряємо, чи унікальний email
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new ConflictException('Користувач з таким email вже існує');
        }

        // Хешуємо пароль (безпека)
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                organizationId: data.organizationId,
                isPremium: data.isPremium || false,
            },
        });

        return this.generateToken(user);
    }

    // 2. Вхід за логіном і паролем (C16)
    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Невірний email або пароль');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Невірний email або пароль');
        }

        return this.generateToken(user);
    }

    // 3. Вхід / Реєстрація через OAuth2 (Google / Microsoft) - Вимога C16
    async oauthLogin(data: {
        email: string;
        name?: string;
        provider: string; // 'google' | 'microsoft'
        organizationId: number;
    }) {
        let user = await this.prisma.user.findUnique({ where: { email: data.email } });

        if (!user) {
            // Якщо користувач вперше заходить через Google/Microsoft - створюємо його
            const dummyPassword = await bcrypt.hash(Math.random().toString(), 10);
            user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name || `${data.provider} User`,
                    password: dummyPassword,
                    organizationId: data.organizationId,
                },
            });
        }

        return this.generateToken(user);
    }

    private generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            isPremium: user.isPremium,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                organizationId: user.organizationId,
                isPremium: user.isPremium,
            },
        };
    }
}