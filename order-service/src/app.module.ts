import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderWriteModel } from './order/infrastructure/order.write-model';
import { OrderItemWriteModel } from './order/infrastructure/order-item.write-model';
import { OrderReadModel } from './order/infrastructure/order.read-model';

@Module({
  imports: [OrderModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '172.17.0.2',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'cqs',
      entities: [OrderWriteModel, OrderItemWriteModel, OrderReadModel],
      synchronize: false,
      logging: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
