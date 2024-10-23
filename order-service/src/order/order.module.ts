import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SqlOrderRepository } from './infrastructure/sql-order.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderWriteModel } from './infrastructure/order.write-model';
import { OrderItemWriteModel } from './infrastructure/order-item.write-model';
import { OrderReadModel } from './infrastructure/order.read-model';

@Module({
  imports: [TypeOrmModule.forFeature([OrderWriteModel, OrderItemWriteModel, OrderReadModel])],
  providers: [
    OrderService,
    {
      provide: 'ORDER_REPOSITORY',
      useClass: SqlOrderRepository,
    },
  ],
  controllers: [OrderController],
})
export class OrderModule {}
