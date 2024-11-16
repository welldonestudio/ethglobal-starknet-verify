import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmConfigService } from './configuration/typorm.config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { StarknetVerificationModule } from './starknet/starknet-verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    StarknetVerificationModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
