import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';

export class OrderItemDto {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export class OrderDto {
  customerId: string;
  orderItems: OrderItemDto[];
}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@Body() order: OrderDto) {
    console.log('OrderController.createOrder()', order);
    this.orderService.createOrder(order);
  }
}
