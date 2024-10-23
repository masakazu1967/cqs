import { v4 as uuidv4 } from 'uuid';

export type OrderItemProps = {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export class OrderItem {
  constructor(private _id: string, private props: OrderItemProps) {}

  static create(props: OrderItemProps): OrderItem {
    const id = uuidv4();
    return new OrderItem(id, props);
  }

  static restore(id: string, props: OrderItemProps): OrderItem {
    return new OrderItem(id, props);
  }

  get id(): string {
    return this._id;
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }
}
