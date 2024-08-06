import { Module } from '@nestjs/common';
import { GoogleDriveService } from './service/google-drive.service';
import { GoogleDriveController } from './controller/google-drive.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService],
})
export class GoogleDriveModule {}
