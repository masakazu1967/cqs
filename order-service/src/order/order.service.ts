import { Inject, Injectable } from '@nestjs/common';
import { OrderDto } from './order.controller';
import { OrderRepository } from './domain/order.repository';
import { OrderItem } from './domain/order-item';
import { Order } from './domain/order';

@Injectable()
export class OrderService {
  constructor(@Inject('ORDER_REPOSITORY') private readonly orderRepository: OrderRepository) {}

  async createOrder(orderDto: OrderDto): Promise<void> {
    console.log('OrderService.createOrder()', orderDto);
    const order = this.toDomain(orderDto);
    await this.orderRepository.save(order);
  }

  private toDomain(orderDto: OrderDto): Order {
    const orderItems = orderDto.orderItems.map((oi) => OrderItem.create(oi));
    const { customerId } = orderDto;
    const props = { customerId, orderItems };
    return Order.create(props);
  }
}
