import { Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheckResult, PrismaHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private health: HealthCheckService,
    private prismaHealthIndicator: PrismaHealthIndicator,
    private prisma: PrismaService
  ) {}

  @HealthCheck()
  async checkHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.prismaHealthIndicator.pingCheck('database', this.prisma),
      async () => ({
        api: {
          status: 'up'
        }
      })
    ]);
  }
}
