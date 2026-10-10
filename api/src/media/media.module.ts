import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { LocalStorage } from './local-storage.js';
import { R2Storage } from './r2-storage.js';
import { StorageService } from './storage.service.js';
import { UploadsController } from './uploads.controller.js';
import { UploadsService } from './uploads.service.js';

@Global()
@Module({
  controllers: [UploadsController],
  providers: [
    {
      provide: StorageService,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): StorageService => {
        const get = <K extends keyof Env>(key: K) => config.get(key, { infer: true }) as Env[K];
        if (get('MEDIA_STORAGE') === 'r2') {
          return new R2Storage({
            accountId: get('R2_ACCOUNT_ID')!,
            accessKeyId: get('R2_ACCESS_KEY_ID')!,
            secretAccessKey: get('R2_SECRET_ACCESS_KEY')!,
            bucket: get('R2_BUCKET')!,
            publicBaseUrl: get('MEDIA_BASE_URL'),
          });
        }
        return new LocalStorage({
          root: get('MEDIA_DIR'),
          publicBaseUrl: get('MEDIA_BASE_URL'),
          apiUrl: get('BETTER_AUTH_URL'),
          secret: get('BETTER_AUTH_SECRET'),
        });
      },
    },
    UploadsService,
  ],
  exports: [StorageService],
})
export class MediaModule {}
