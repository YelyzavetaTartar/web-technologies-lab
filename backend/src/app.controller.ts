import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Render,
    Redirect,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    // Головна MVC сторінка зі списком усіх сутностей
    @Get()
    @Render('index')
    async root() {
        const organizations = await this.appService.getAllData();
        return { organizations };
    }

    // Створення Організації
    @Post('organizations')
    @Redirect('/')
    async createOrg(
        @Body('name') name: string,
        @Body('description') description?: string,
    ) {
        await this.appService.createOrganization(name, description);
    }

    // Видалення Організації
    @Post('organizations/:id/delete')
    @Redirect('/')
    async deleteOrg(@Param('id') id: string) {
        await this.appService.deleteOrganization(Number(id));
    }

    // Створення Проєкту
    @Post('projects')
    @Redirect('/')
    async createProject(
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('organizationId') organizationId: string,
    ) {
        await this.appService.createProject(
            name,
            description,
            Number(organizationId),
        );
    }

    // Видалення Проєкту
    @Post('projects/:id/delete')
    @Redirect('/')
    async deleteProject(@Param('id') id: string) {
        await this.appService.deleteProject(Number(id));
    }

    // Створення Завдання (Task) із завантаженням файлу
    @Post('tasks')
    @Redirect('/')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async createTask(
        @Body('title') title: string,
        @Body('description') description: string,
        @Body('projectId') projectId: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const fileUrl = file ? `/uploads/${file.filename}` : undefined;
        await this.appService.createTask(
            title,
            description,
            Number(projectId),
            fileUrl,
        );
    }

    // Оновлення статусу завдання
    @Post('tasks/:id/status')
    @Redirect('/')
    async updateTaskStatus(
        @Param('id') id: string,
        @Body('status') status: string,
    ) {
        await this.appService.updateTaskStatus(Number(id), status);
    }

    // Видалення завдання
    @Post('tasks/:id/delete')
    @Redirect('/')
    async deleteTask(@Param('id') id: string) {
        await this.appService.deleteTask(Number(id));
    }
}