import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpStatus,
    HttpCode,
    BadRequestException,
    Query,
    Req,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { AuthGuard } from '@nestjs/passport';

@Controller('api')
export class ApiController {
    constructor(private readonly appService: AppService) { }

    // 1. ORGANIZATIONS API (/api/organizations)

    @Get('organizations')
    @UseInterceptors(CacheInterceptor)
    @CacheKey('all_organizations')
    @CacheTTL(30000)
    async getAllOrganizations() {
        console.log('--- [Запит до БД] Отримання організацій ---');
        return this.appService.getOrganizations();
    }
       
    @Get('organizations/:id')
    async getOrganization(@Param('id') id: string) {
        return this.appService.getOrganizationById(Number(id));
    }

    @Post('organizations')
    @HttpCode(HttpStatus.CREATED) // Код 201
    async createOrganization(@Body() body: { name: string; description?: string }) {
        if (!body.name) {
            throw new BadRequestException("Поле 'name' обов'язкове (код 400)");
        }
        return this.appService.createOrganization(body.name, body.description);
    }

    @Put('organizations/:id')
    @HttpCode(HttpStatus.OK) // Код 200
    async updateOrganization(
        @Param('id') id: string,
        @Body() body: { name: string; description?: string },
    ) {
        if (!body.name) {
            throw new BadRequestException("Поле 'name' обов'язкове");
        }
        return this.appService.updateOrganization(Number(id), body.name, body.description);
    }

    @Delete('organizations/:id')
    @HttpCode(HttpStatus.OK) // Код 200
    async deleteOrganization(@Param('id') id: string) {
        return this.appService.deleteOrganization(Number(id));
    }

    // 2. PROJECTS API (/api/projects)

    @Get('projects')
    async getAllProjects() {
        return this.appService.getProjects();
    }

    @Get('projects/:id')
    async getProject(@Param('id') id: string) {
        return this.appService.getProjectById(Number(id));
    }

    @Post('projects')
    @HttpCode(HttpStatus.CREATED) // Код 201
    async createProject(
        @Body() body: { name: string; description?: string; organizationId: number },
    ) {
        if (!body.name || !body.organizationId) {
            throw new BadRequestException("Поля 'name' та 'organizationId' обов'язкові (код 400)");
        }
        return this.appService.createProject(body.name, body.description || '', Number(body.organizationId));
    }

    @Put('projects/:id')
    @HttpCode(HttpStatus.OK)
    async updateProject(
        @Param('id') id: string,
        @Body() body: { name: string; description?: string },
    ) {
        return this.appService.updateProject(Number(id), body.name, body.description);
    }

    @Delete('projects/:id')
    @HttpCode(HttpStatus.OK)
    async deleteProject(@Param('id') id: string) {
        return this.appService.deleteProject(Number(id));
    }

    // 3. TASKS API (/api/tasks)

    @Get('tasks')
    async getAllTasks(
        @Query('skip') skip ?: string,
        @Query('limit') limit ?: string,
        @Req() req ?: any,
    ) {
        const skipNum = skip ? parseInt(skip, 10) : 0;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const protocol = req?.protocol || 'http';
        const host = req?.get ? req.get('host') : 'localhost:3000';
        const baseUrl = `${protocol}://${host}/api/tasks`;

        return this.appService.getTasksPaginated(skipNum, limitNum, baseUrl);
    }

    @Get('tasks/:id')
    async getTask(@Param('id') id: string) {
        return this.appService.getTaskById(Number(id));
    }

    @Post('tasks')
    @HttpCode(HttpStatus.CREATED) // Код 201
    async createTask(
        @Body() body: { title: string; description?: string; projectId: number; fileUrl?: string },
    ) {
        if (!body.title || !body.projectId) {
            throw new BadRequestException("Поля 'title' та 'projectId' обов'язкові (код 400)");
        }
        return this.appService.createTask(
            body.title,
            body.description || '',
            Number(body.projectId),
            body.fileUrl,
        );
    }

    @Put('tasks/:id')
    @HttpCode(HttpStatus.OK)
    async updateTask(
        @Param('id') id: string,
        @Body() body: { title?: string; description?: string; status?: string; fileUrl?: string },
    ) {
        return this.appService.updateTask(Number(id), body);
    }

    @Delete('tasks/:id')
    @HttpCode(HttpStatus.OK)
    async deleteTask(@Param('id') id: string) {
        return this.appService.deleteTask(Number(id));
    }
    
    // 4. ТЕНАНТНІ ЕНДПОІНТИ (Вимога B5)
   

    // Отримати проєкти тільки свого тенанта за JWT токеном
    @Get('tenant/projects')
    @UseGuards(AuthGuard('jwt'))
    async getMyTenantProjects(@Req() req: any) {
        const tenantId = req.user.organizationId;
        return this.appService.getTenantProjects(tenantId);
    }

    // Створити проєкт у своєму тенанті
    @Post('tenant/projects')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    async createMyTenantProject(
        @Req() req: any,
        @Body() body: { name: string; description?: string },
    ) {
        if (!body.name) {
            throw new BadRequestException("Поле 'name' обов'язкове");
        }
        const tenantId = req.user.organizationId;
        return this.appService.createTenantProject(body.name, body.description || '', tenantId);
    }
}