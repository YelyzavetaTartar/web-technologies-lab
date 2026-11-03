import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
    constructor(private prisma: PrismaService) { }

    // Отримати всі організації разом із проєктами та завданнями
    async getAllData() {
        return this.prisma.organization.findMany({
            include: {
                projects: {
                    include: {
                        tasks: true,
                    },
                },
            },
            orderBy: { id: 'asc' },
        });
    }

    // --- CRUD: Organization ---
    async createOrganization(name: string, description?: string) {
        return this.prisma.organization.create({
            data: { name, description },
        });
    }

    async deleteOrganization(id: number) {
        return this.prisma.organization.delete({ where: { id } });
    }

    // --- CRUD: Project ---
    async createProject(name: string, description: string, organizationId: number) {
        return this.prisma.project.create({
            data: { name, description, organizationId },
        });
    }

    async deleteProject(id: number) {
        return this.prisma.project.delete({ where: { id } });
    }

    // --- CRUD: Task (з файлом) ---
    async createTask(title: string, description: string, projectId: number, fileUrl?: string) {
        return this.prisma.task.create({
            data: {
                title,
                description,
                projectId,
                fileUrl,
            },
        });
    }

    async updateTaskStatus(id: number, status: string) {
        return this.prisma.task.update({
            where: { id },
            data: { status },
        });
    }

    async deleteTask(id: number) {
        return this.prisma.task.delete({ where: { id } });
    }
}