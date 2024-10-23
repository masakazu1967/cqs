import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: 'VIEW_ORDER',
  expression: ''
})
export class OrderReadModel {
  @ViewColumn({ name: 'H_ID' })
  id!: string;

  @ViewColumn({ name: 'H_CUSTOMER_ID' })
  customerId!: string;

  @ViewColumn({ name: 'H_ORDER_DATE' })
  orderDate!: Date;

  @ViewColumn({ name: 'D_ID' })
  orderDetailId!: string;

  @ViewColumn({ name: 'D_ITEM_ID' })
  orderDetailItemId!: string;

  @ViewColumn({ name: 'D_QUANTITY' })
  orderDetailQuantity!: number;

  @ViewColumn({ name: 'D_UNIT_PRICE' })
  orderDetailUnitPrice!: number;
}
