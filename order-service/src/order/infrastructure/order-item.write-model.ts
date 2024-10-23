import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: 'ORDER_ITEM', comment: '注文明細' })
export class OrderItemWriteModel {
  @PrimaryColumn({ name: 'ID', comment: '注文明細ID' })
  id!: string;

  @Column({ name: 'ORDER_ID', comment: '注文ID' })
  orderId!: string;

  @Column({ name: 'ITEM_ID', comment: '品目ID' })
  itemId!: string;

  @Column({ name: 'QUANTITY', comment: '数量' })
  quantity!: number;

  @Column({ name: 'UNIT_PRICE', comment: '単価' })
  unitPrice!: number;
}
