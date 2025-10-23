import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PaymentModule } from './payment.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(3005);
  console.log('Payment Service running on port 3005');
}
bootstrap();
