import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OrderDto, OrderReadDto, OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':id')
  async findById(@Param('id') id: string): Promise<OrderReadDto> {
    const order = await this.orderService.findById(id);
    if (order == null) {
      throw new NotFoundException();
    }
    return order;
  }

  @Post()
  createOrder(@Body() order: OrderDto) {
    console.log('OrderController.createOrder()', order);
    this.orderService.createOrder(order);
  }
}
