import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleDriveService } from '../service/google-drive.service';
import { APP_MESSAGES } from '../common/messages';

@Controller('google-drive')
export class GoogleDriveController {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private configService: ConfigService,
  ) {}

  @Get('oauth')
  async getAuthUrl(@Res() res) {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
    const authUrl = this.googleDriveService.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.redirect(authUrl);
  }

  @Get('oauth/callback')
  async oauthCallBack(@Req() req, @Res() res) {
    const code = req.query.code;
    console.log('Code:', code);
    const { tokens } =
      await this.googleDriveService.oauth2Client.getToken(code);
    await this.googleDriveService.setCredentials(tokens);
    console.log('tokens:', tokens);

    /* Fetch User details from google service*/
    const userInfo = await this.googleDriveService.getUserInfo();

    /* insert User into Databsse If new */
    const savedUser = await this.googleDriveService.saveUser(
      userInfo.id,
      userInfo.name,
      userInfo.email,
      userInfo.picture,
    );

    /* Send success response for callback */
    res.send({
      message: APP_MESSAGES.callBackSuccess,
      user: savedUser,
    });
  }

  @Get('upload')
  async uploadFile(@Req() req, @Res() res) {
    const { fileName, mimeType } = req.query;

    /* Upload file to Drive */
    const fileData = await this.googleDriveService.uploadFile(
      fileName,
      mimeType,
    );
    res.send(fileData);
  }
}
