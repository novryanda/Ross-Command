export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'draft' | 'out_of_stock'
}

export const products: Product[] = [
  { id: 'PRD-001', name: 'Wireless Headphones', category: 'Audio', price: 129.0, stock: 142, status: 'active' },
  { id: 'PRD-002', name: 'Mechanical Keyboard', category: 'Accessories', price: 89.0, stock: 64, status: 'active' },
  { id: 'PRD-003', name: 'USB-C Hub 7-in-1', category: 'Accessories', price: 49.0, stock: 0, status: 'out_of_stock' },
  { id: 'PRD-004', name: '4K Webcam', category: 'Video', price: 159.0, stock: 28, status: 'active' },
  { id: 'PRD-005', name: 'Ergonomic Mouse', category: 'Accessories', price: 39.0, stock: 210, status: 'active' },
  { id: 'PRD-006', name: 'Studio Microphone', category: 'Audio', price: 199.0, stock: 17, status: 'draft' },
  { id: 'PRD-007', name: 'Laptop Stand', category: 'Accessories', price: 45.0, stock: 88, status: 'active' },
  { id: 'PRD-008', name: 'Portable SSD 1TB', category: 'Storage', price: 119.0, stock: 53, status: 'active' },
  { id: 'PRD-009', name: 'Noise-Cancel Earbuds', category: 'Audio', price: 99.0, stock: 0, status: 'out_of_stock' },
  { id: 'PRD-010', name: 'Monitor Light Bar', category: 'Accessories', price: 59.0, stock: 124, status: 'active' },
  { id: 'PRD-011', name: 'Smart LED Desk Lamp', category: 'Office', price: 69.0, stock: 41, status: 'draft' },
  { id: 'PRD-012', name: 'Gaming Headset Pro', category: 'Audio', price: 149.0, stock: 76, status: 'active' }
]

export type Order = {
  id: string
  customer: string
  email: string
  total: number
  items: number
  status: 'paid' | 'pending' | 'refunded' | 'cancelled'
  date: string
}

export const orders: Order[] = [
  { id: 'ORD-2451', customer: 'Olivia Martin', email: 'olivia@example.com', total: 218.0, items: 2, status: 'paid', date: '2025-05-21' },
  { id: 'ORD-2450', customer: 'Jackson Lee', email: 'jackson@example.com', total: 89.0, items: 1, status: 'pending', date: '2025-05-21' },
  { id: 'ORD-2449', customer: 'Isabella Nguyen', email: 'isabella@example.com', total: 457.0, items: 4, status: 'paid', date: '2025-05-20' },
  { id: 'ORD-2448', customer: 'William Kim', email: 'will@example.com', total: 49.0, items: 1, status: 'refunded', date: '2025-05-20' },
  { id: 'ORD-2447', customer: 'Sofia Davis', email: 'sofia@example.com', total: 312.0, items: 3, status: 'paid', date: '2025-05-19' },
  { id: 'ORD-2446', customer: 'Liam Johnson', email: 'liam@example.com', total: 159.0, items: 1, status: 'cancelled', date: '2025-05-19' },
  { id: 'ORD-2445', customer: 'Emma Wilson', email: 'emma@example.com', total: 99.0, items: 1, status: 'pending', date: '2025-05-18' },
  { id: 'ORD-2444', customer: 'Noah Brown', email: 'noah@example.com', total: 528.0, items: 5, status: 'paid', date: '2025-05-18' },
  { id: 'ORD-2443', customer: 'Ava Garcia', email: 'ava@example.com', total: 45.0, items: 1, status: 'paid', date: '2025-05-17' },
  { id: 'ORD-2442', customer: 'Mason Rodriguez', email: 'mason@example.com', total: 238.0, items: 2, status: 'refunded', date: '2025-05-17' }
]

export type Customer = {
  id: string
  name: string
  email: string
  orders: number
  spent: number
  status: 'active' | 'new' | 'churned'
}

export const customers: Customer[] = [
  { id: 'CUS-001', name: 'Olivia Martin', email: 'olivia@example.com', orders: 12, spent: 2480.0, status: 'active' },
  { id: 'CUS-002', name: 'Jackson Lee', email: 'jackson@example.com', orders: 3, spent: 312.0, status: 'new' },
  { id: 'CUS-003', name: 'Isabella Nguyen', email: 'isabella@example.com', orders: 27, spent: 6190.0, status: 'active' },
  { id: 'CUS-004', name: 'William Kim', email: 'will@example.com', orders: 1, spent: 49.0, status: 'churned' },
  { id: 'CUS-005', name: 'Sofia Davis', email: 'sofia@example.com', orders: 8, spent: 1740.0, status: 'active' },
  { id: 'CUS-006', name: 'Liam Johnson', email: 'liam@example.com', orders: 2, spent: 208.0, status: 'new' },
  { id: 'CUS-007', name: 'Emma Wilson', email: 'emma@example.com', orders: 15, spent: 3320.0, status: 'active' },
  { id: 'CUS-008', name: 'Noah Brown', email: 'noah@example.com', orders: 5, spent: 980.0, status: 'churned' }
]

export const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
