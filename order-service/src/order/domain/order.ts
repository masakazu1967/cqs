import { OrderItem } from './order-item';
import { v4 as uuidv4 } from 'uuid';

export type OrderProps = {
  customerId: string;
  orderDate: Date;
  orderItems: OrderItem[];
}

export type CreateOrderProps = {
  customerId: string;
  orderItems: OrderItem[];
}

export class Order {
  constructor(private _id: string, private props: OrderProps) {}

  static create(createProps: CreateOrderProps): Order {
    const id = uuidv4();
    // 時刻は不要だが簡易版
    const props = { orderDate: new Date(), ...createProps };
    return new Order(id, props);
  }

  static restore(id: string, props: OrderProps): Order {
    return new Order(id, props);
  }

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get orderDate(): Date {
    return this.props.orderDate;
  }

  get orderItems(): OrderItem[] {
    return this.props.orderItems;
  }
}
