import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/User.entity';
import { google, drive_v3, oauth2_v2 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleDriveService {
  oauth2Client: OAuth2Client;
  private drive: drive_v3.Drive;
  private oauth2: oauth2_v2.Oauth2;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    this.oauth2 = google.oauth2({ auth: this.oauth2Client, version: 'v2' });
  }

  async findOne(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  async setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async uploadFile(fileName: string, mimeType: string) {
    const fileMetadata = {
      fileName,
      mimeType,
    };

    return {
      message: 'success',
      fileMetadata,
    };
  }

  async getUserInfo() {
    const response = await this.oauth2.userinfo.get();
    return response.data;
  }

  async saveUser(
    googleId: string,
    name: string,
    email: string,
    pictureUrl: string,
  ) {
    let user = await this.userRepository.findOne({ where: { googleId } });

    /* Insert into Database if User doesnot exist */
    if (!user) {
      user = this.userRepository.create({ googleId, name, email, pictureUrl });
      await this.userRepository.save(user);
    }

    return user;
  }
}
