import { OrderItem } from "./orderItem.model"

export interface Order{
    id: number
    userId: number
    orderDate: Date
    orderSum: number
    orderItemes: OrderItem[]
}