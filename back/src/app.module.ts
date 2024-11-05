import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CreditsModule } from './credits/credits.module';
import { SavingsModule } from './savings/savings.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, CreditsModule, SavingsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
