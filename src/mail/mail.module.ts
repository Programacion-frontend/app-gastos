import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { MailService } from './mail.service';
import { MailProvider } from './providers/mail.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: 'MAIL_TRANSPORT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return nodemailer.createTransport({
          host: config.get<string>('MAIL_HOST') || 'smtp.gmail.com',
          port: parseInt(config.get<string>('MAIL_PORT') || '465'),
          secure: true,
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      },
    },
    MailProvider,
  ],
  exports: [MailService],
})
export class MailModule {}
