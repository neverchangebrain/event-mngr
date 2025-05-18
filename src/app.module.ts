import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './health/prisma.health';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { ParticipantsModule } from './participants/participants.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, TerminusModule, AuthModule, EventsModule, ParticipantsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, PrismaHealthIndicator]
})
export class AppModule {}
