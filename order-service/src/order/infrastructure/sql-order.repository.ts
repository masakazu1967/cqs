import { Injectable } from "@nestjs/common";
import { Order } from "../domain/order";
import { OrderRepository } from "../domain/order.repository";
import { OrderWriteModel } from "./order.write-model";
import { OrderItemWriteModel } from "./order-item.write-model";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { OrderReadModel } from "./order.read-model";
import { OrderItem } from "../domain/order-item";

type OrderWriteModelQuality = OrderWriteModel & {
  quantityFunction: () => number;
};

@Injectable()
export class SqlOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderWriteModel)
    private readonly orderWriteModelRepository: Repository<OrderWriteModel>,
    @InjectRepository(OrderReadModel)
    private readonly orderReadModelRepository: Repository<OrderReadModel>,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const records = await this.orderReadModelRepository.findBy({ id });
    return this.fromRecord(records);
  }

  private fromRecord(records: OrderReadModel[]): Order | null {
    if (records.length === 0) {
      return null;
    }
    const orderItems = records.map((record) => {
      const id = record.orderDetailId;
      const itemId = record.orderDetailItemId;
      const quantity = record.orderDetailQuantity;
      const unitPrice = record.orderDetailUnitPrice;
      return OrderItem.restore(id, { itemId, quantity, unitPrice });
    });
    const { id, customerId, orderDate } = records[0];
    return Order.restore(id, { customerId, orderDate, orderItems });
  }

  private async existOrder(id: string, manager: EntityManager): Promise<boolean> {
    const count = await manager.createQueryBuilder()
      .select('order')
      .from(OrderWriteModel, 'order')
      .where('order.id = :id', { id })
      .getCount();
    console.log('SqlOrderRepository.existOrder()', count);
    return count > 0;
  }

  private async existOrderItem(id: string, manager: EntityManager): Promise<boolean> {
    const count = await manager.createQueryBuilder()
      .select('orderItem')
      .from(OrderItemWriteModel, 'orderItem')
      .where('orderItem.id = :id', { id })
      .getCount();
    console.log('SqlOrderRepository.existOrderItem()', count);
    return count > 0;
  }

  private async insertOrder(order: OrderWriteModel, manager: EntityManager): Promise<void> {
    await manager.createQueryBuilder()
      .insert()
      .into(OrderWriteModel)
      .values(order)
      .execute();
  }

  private updatedOrderItem(orderItem: OrderItemWriteModel, orderId: string) {
    const {quantity, ...rest} = orderItem;
    return {...rest, orderId, quantity: this.addOne(orderItem.quantity)};
  }

  private async insertOrderItem(orderItem: OrderItemWriteModel, orderId: string, manager: EntityManager): Promise<void> {
    await manager.createQueryBuilder()
      .insert()
      .into(OrderItemWriteModel)
      .values(this.updatedOrderItem(orderItem, orderId))
      .execute();
  }

  private async updateOrder(order: OrderWriteModel, manager: EntityManager): Promise<void> {
    await manager.createQueryBuilder()
      .update(OrderWriteModel)
      .set(order)
      .where('id = :id', { id: order.id })
      .execute();
  }

  private async updateOrderItem(orderItem: OrderItemWriteModel, orderId: string, manager: EntityManager): Promise<void> {
    await manager.createQueryBuilder()
      .update(OrderItemWriteModel)
      .set(this.updatedOrderItem(orderItem, orderId))
      .where('id = :id', { id: orderItem.id })
      .execute();
  }

  private addOne(quantity: number): () => string {
    return () => `add_one(${quantity})`;
  }

  async save(order: Order): Promise<void> {
    console.log('SqlOrderRepository.save()', order);
    const [orderRecord, orderItemRecords] = this.toRecord(order);
    console.log('order record: ', orderRecord);
    console.log('order item record', orderItemRecords);
    await this.orderWriteModelRepository.manager.transaction(async (manager) => {
      if (await this.existOrder(orderRecord.id, manager)) {
        await this.updateOrder(orderRecord, manager);
      } else {
        await this.insertOrder(orderRecord, manager);
      }

      orderItemRecords.forEach(async (oi) => {
        if (await this.existOrderItem(oi.id, manager)) {
          await this.updateOrderItem(oi, orderRecord.id, manager);
        } else {
          await this.insertOrderItem(oi, orderRecord.id, manager);
        }
      });
    });
    return;
  }

  private toRecord(domain: Order): [OrderWriteModel, OrderItemWriteModel[]] {
    const record = new OrderWriteModel();
    record.id = domain.id;
    record.customerId = domain.customerId;
    record.orderDate = domain.orderDate;
    const orderItems = domain.orderItems.map((i) => {
      const record = new OrderItemWriteModel();
      record.id = i.id;
      record.itemId = i.itemId;
      record.quantity = i.quantity;
      record.unitPrice = i.unitPrice;
      return record;
    });
    return [record, orderItems];
  }
}
