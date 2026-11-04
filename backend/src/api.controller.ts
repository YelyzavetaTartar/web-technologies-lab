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
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class ApiController {
    constructor(private readonly appService: AppService) { }

    // 1. ORGANIZATIONS API (/api/organizations)

    @Get('organizations')
    async getAllOrganizations() {
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
    async getAllTasks() {
        return this.appService.getTasks();
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
}