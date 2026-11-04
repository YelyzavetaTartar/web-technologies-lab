import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
    constructor(private prisma: PrismaService) { }

    // Отримати всі дані для MVC
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

    // REST API: ORGANIZATIONS
    async getOrganizations() {
        return this.prisma.organization.findMany({
            include: { projects: true },
            orderBy: { id: 'asc' },
        });
    }

    async getOrganizationById(id: number) {
        const org = await this.prisma.organization.findUnique({
            where: { id },
            include: { projects: true },
        });
        if (!org) throw new NotFoundException(`Організацію з ID ${id} не знайдено`);
        return org;
    }

    async createOrganization(name: string, description?: string) {
        return this.prisma.organization.create({
            data: { name, description },
        });
    }

    async updateOrganization(id: number, name: string, description?: string) {
        await this.getOrganizationById(id);
        return this.prisma.organization.update({
            where: { id },
            data: { name, description },
        });
    }

    async deleteOrganization(id: number) {
        await this.getOrganizationById(id);
        return this.prisma.organization.delete({ where: { id } });
    }

    // REST API: PROJECTS
    async getProjects() {
        return this.prisma.project.findMany({
            include: { tasks: true },
            orderBy: { id: 'asc' },
        });
    }

    async getProjectById(id: number) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: { tasks: true },
        });
        if (!project) throw new NotFoundException(`Проєкт з ID ${id} не знайдено`);
        return project;
    }

    async createProject(name: string, description: string, organizationId: number) {
        await this.getOrganizationById(organizationId);
        return this.prisma.project.create({
            data: { name, description, organizationId },
        });
    }

    async updateProject(id: number, name: string, description?: string) {
        await this.getProjectById(id);
        return this.prisma.project.update({
            where: { id },
            data: { name, description },
        });
    }

    async deleteProject(id: number) {
        await this.getProjectById(id);
        return this.prisma.project.delete({ where: { id } });
    }

    // REST API: TASKS
    async getTasks() {
        return this.prisma.task.findMany({
            orderBy: { id: 'asc' },
        });
    }

    async getTaskById(id: number) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException(`Завдання з ID ${id} не знайдено`);
        return task;
    }

    async createTask(title: string, description: string, projectId: number, fileUrl?: string) {
        await this.getProjectById(projectId);
        return this.prisma.task.create({
            data: { title, description, projectId, fileUrl },
        });
    }

    async updateTask(id: number, data: { title?: string; description?: string; status?: string; fileUrl?: string }) {
        await this.getTaskById(id);
        return this.prisma.task.update({
            where: { id },
            data,
        });
    }

    async updateTaskStatus(id: number, status: string) {
        await this.getTaskById(id);
        return this.prisma.task.update({
            where: { id },
            data: { status },
        });
    }

    async deleteTask(id: number) {
        await this.getTaskById(id);
        return this.prisma.task.delete({ where: { id } });
    }
}