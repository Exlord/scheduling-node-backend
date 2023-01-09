import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulingModule } from './scheduling/scheduling.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientModule } from './client/client.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [SchedulingModule, PrismaModule, ClientModule, ServiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
