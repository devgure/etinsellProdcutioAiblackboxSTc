import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      callbackURL: process.env.APPLE_CALLBACK_URL,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
      scope: ['email', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, idToken: any, profile: any, done: VerifyCallback): Promise<any> {
    const { name, email } = idToken;
    const user = {
      email,
      name: name ? `${name.firstName} ${name.lastName}` : 'Apple User',
      accessToken,
    };
    done(null, user);
  }
}
