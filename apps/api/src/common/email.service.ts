import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer';

interface EmailConfig {
  provider: string;
  from: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(
        'SMTP configuration not found. Email delivery will stay disabled.',
      );
      return;
    }

    this.transporter = this.createTransporter();

    try {
      await this.transporter.verify();
      this.logger.log('SMTP transporter verified successfully.');
    } catch (error) {
      this.logger.error('Failed to verify SMTP transporter.', error);
    }
  }

  isConfigured(): boolean {
    return [
      'EMAIL_PROVIDER',
      'EMAIL_FROM',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_SECURE',
      'SMTP_USER',
      'SMTP_PASS',
    ].every((key) => {
      const value = this.configService.get<string>(key);
      return typeof value === 'string' && value.trim().length > 0;
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.transporter) {
      if (!this.isConfigured()) {
        throw new Error('Email service is not configured.');
      }
      this.transporter = this.createTransporter();
    }

    await this.transporter.sendMail({
      from: this.getConfig().from,
      ...options,
    });
  }

  async sendPlainTextMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    });
  }

  private createTransporter(): Transporter {
    const emailConfig = this.getConfig();

    if (emailConfig.provider !== 'smtp') {
      throw new Error(
        `Unsupported email provider "${emailConfig.provider}". Only "smtp" is supported right now.`,
      );
    }

    return nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });
  }

  private getConfig(): EmailConfig {
    return {
      provider: this.configService
        .getOrThrow<string>('EMAIL_PROVIDER')
        .toLowerCase(),
      from: this.configService.getOrThrow<string>('EMAIL_FROM'),
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configService.getOrThrow<string>('SMTP_PORT')),
      secure: this.parseBoolean(
        this.configService.getOrThrow<string>('SMTP_SECURE'),
      ),
      user: this.configService.getOrThrow<string>('SMTP_USER'),
      pass: this.configService.getOrThrow<string>('SMTP_PASS'),
    };
  }

  private parseBoolean(value: string): boolean {
    return value.trim().toLowerCase() === 'true';
  }
}
