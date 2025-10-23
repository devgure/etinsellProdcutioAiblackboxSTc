import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MatchModule } from './match.module';

async function bootstrap() {
  const app = await NestFactory.create(MatchModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Match Service running on port ${port}`);
}

bootstrap();
