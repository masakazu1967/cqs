import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
@Entity({ name: 'ORDER', comment: '注文' })
export class OrderWriteModel {
  @PrimaryColumn({ name: 'ID', comment: '注文ID' })
  id!: string;

  @Column({ name: 'CUSTOMER_ID', comment: '顧客ID' })
  customerId!: string;

  @Column({ name: 'ORDER_DATE', comment: '注文日' })
  orderDate!: Date;
}
