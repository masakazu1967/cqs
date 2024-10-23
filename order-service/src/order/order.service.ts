import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from './domain/order.repository';
import { OrderItem } from './domain/order-item';
import { Order } from './domain/order';
export class OrderItemDto {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export class OrderDto {
  customerId: string;
  orderItems: OrderItemDto[];
}

export class OrderItemReadDto {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export class OrderReadDto {
  id: string;
  customerId: string;
  orderDate: string;
  orderItems: OrderItemReadDto[];
};

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

  async findById(id: string): Promise<OrderReadDto> {
    const order = await this.orderRepository.findById(id);
    console.log('findById', order);
    return order != null ? this.fromDomain(order) : null;
  }

  private fromDomain(domain: Order): OrderReadDto {
    const order = new OrderReadDto();
    order.id = domain.id;
    order.customerId = domain.customerId;
    order.orderDate = domain.orderDate.toLocaleDateString('sv-SE');
    order.orderItems = domain.orderItems.map((orderItem) => {
      const dto = new OrderItemReadDto();
      dto.id = orderItem.id;
      dto.itemId = orderItem.itemId;
      dto.quantity = orderItem.quantity;
      dto.unitPrice = orderItem.unitPrice;
      return dto;
    });
    return order;
  }
}
