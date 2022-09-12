import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from "passport";

import * as serviceAccount from '../serviceAccountKey.json';
import { initializeApp, cert } from 'firebase-admin/app';
import { ServiceAccount } from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const configService = app.get(ConfigService);
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    storageBucket: configService.get<string>('firebaseCredentials.bucket'),
  });
  app.use(
    session({
      secret: configService.get<string>('session.secret'),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  
  await app.listen(configService.get('port'));
}
bootstrap();
