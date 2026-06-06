// Default mock data to seed localStorage if not present

export const defaultShops = [
  { _id: "shop-1", name: "iRepair Pro", address: "101 Broadway Ave, New York", phone: "+1 555-0199", email: "contact@irepairpro.com", isActive: true, createdAt: "2026-01-15T08:00:00.000Z" },
  { _id: "shop-2", name: "Mobo Fixers", address: "404 Silicon Valley Blvd, San Jose", phone: "+1 555-0144", email: "info@mobofixers.com", isActive: true, createdAt: "2026-02-10T09:30:00.000Z" },
  { _id: "shop-3", name: "QuickFix Gadgets", address: "789 Pine St, Seattle", phone: "+1 555-0177", email: "hello@quickfix.com", isActive: false, createdAt: "2026-03-05T10:15:00.000Z" }
];

export const defaultUsers = [
  { _id: "user-1", name: "Sarah Connor", email: "superadmin@mobocare.com", role: "superAdmin", shop: null, isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { _id: "user-2", name: "John Doe", email: "admin@mobocare.com", role: "admin", shop: "shop-1", isActive: true, createdAt: "2026-01-16T12:00:00.000Z" },
  { _id: "user-3", name: "Jane Smith", email: "staff@mobocare.com", role: "staff", shop: "shop-1", isActive: true, createdAt: "2026-01-17T09:00:00.000Z" },
  { _id: "user-4", name: "David Miller", email: "admin2@mobocare.com", role: "admin", shop: "shop-2", isActive: true, createdAt: "2026-02-11T11:00:00.000Z" }
];

export const defaultCustomers = [
  { _id: "cust-1", name: "Alice Johnson", phone: "555-123-4567", email: "alice@gmail.com", address: "123 Elm St, NY", shop: "shop-1" },
  { _id: "cust-2", name: "Bob Thompson", phone: "555-987-6543", email: "bob.t@yahoo.com", address: "456 Oak St, NY", shop: "shop-1" },
  { _id: "cust-3", name: "Charlie Green", phone: "555-456-7890", email: "charlie@outlook.com", address: "789 Maple Ave, NY", shop: "shop-1" },
  { _id: "cust-4", name: "Diana Prince", phone: "555-321-7654", email: "diana@wayne.com", address: "100 Gateway Dr, SJ", shop: "shop-2" }
];

export const defaultRepairs = [
  {
    _id: "rep-1",
    repairId: "REP-10021",
    customer: { _id: "cust-1", name: "Alice Johnson", phone: "555-123-4567" },
    deviceType: "Mobile",
    deviceBrand: "Apple",
    deviceModel: "iPhone 15 Pro",
    issue: "Broken OLED Screen & back glass fracture",
    status: "received",
    estimatedCost: 249.99,
    assignedTo: { _id: "user-3", name: "Jane Smith" },
    shop: "shop-1",
    notes: "Customer needs it urgently. Screen screen-1 to be used.",
    createdAt: "2026-06-04T10:00:00.000Z"
  },
  {
    _id: "rep-2",
    repairId: "REP-10022",
    customer: { _id: "cust-2", name: "Bob Thompson", phone: "555-987-6543" },
    deviceType: "Mobile",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy S23 Ultra",
    issue: "Battery drain issue, device gets extremely hot during charging",
    status: "repairing",
    estimatedCost: 120.00,
    assignedTo: { _id: "user-3", name: "Jane Smith" },
    shop: "shop-1",
    notes: "Requires testing the power IC and replacing the battery.",
    createdAt: "2026-06-05T09:15:00.000Z"
  },
  {
    _id: "rep-3",
    repairId: "REP-10023",
    customer: { _id: "cust-3", name: "Charlie Green", phone: "555-456-7890" },
    deviceType: "Tablet",
    deviceBrand: "Apple",
    deviceModel: "iPad Air 5th Gen",
    issue: "USB-C charging port loose, charging cuts off frequently",
    status: "diagnosing",
    estimatedCost: 89.99,
    assignedTo: { _id: "user-2", name: "John Doe" },
    shop: "shop-1",
    notes: "Cleaned port but contacts seem worn out. Recommending port replacement.",
    createdAt: "2026-06-05T11:30:00.000Z"
  },
  {
    _id: "rep-4",
    repairId: "REP-10024",
    customer: { _id: "cust-1", name: "Alice Johnson", phone: "555-123-4567" },
    deviceType: "Laptop",
    deviceBrand: "Apple",
    deviceModel: "MacBook Pro M2",
    issue: "Liquid spill. Keyboard keys unresponsive",
    status: "ready",
    estimatedCost: 350.00,
    assignedTo: { _id: "user-2", name: "John Doe" },
    shop: "shop-1",
    notes: "Cleaned board, keyboard replaced successfully. Tested and fully operational.",
    createdAt: "2026-06-03T14:00:00.000Z"
  },
  {
    _id: "rep-5",
    repairId: "REP-10025",
    customer: { _id: "cust-4", name: "Diana Prince", phone: "555-321-7654" },
    deviceType: "Mobile",
    deviceBrand: "Google",
    deviceModel: "Pixel 8 Pro",
    issue: "Camera glass cracked and lenses scratched",
    status: "delivered",
    estimatedCost: 110.00,
    assignedTo: { _id: "user-4", name: "David Miller" },
    shop: "shop-2",
    notes: "Replaced rear camera lens module. Client paid and collected.",
    createdAt: "2026-06-02T16:45:00.000Z"
  }
];

export const defaultInventoryItems = [
  { _id: "inv-item-1", name: "iPhone 15 Pro OLED Screen", sku: "SCR-IP15P-OEM", category: "Screens", quantity: 3, costPrice: 110.00, sellPrice: 220.00, lowStockAt: 5, shop: "shop-1" },
  { _id: "inv-item-2", name: "iPhone 15/15 Pro Battery Replacement", sku: "BAT-IP15-5G", category: "Batteries", quantity: 12, costPrice: 15.00, sellPrice: 49.99, lowStockAt: 4, shop: "shop-1" },
  { _id: "inv-item-3", name: "Galaxy S23 Ultra Battery (Original)", sku: "BAT-S23U-ORG", category: "Batteries", quantity: 2, costPrice: 22.00, sellPrice: 65.00, lowStockAt: 3, shop: "shop-1" },
  { _id: "inv-item-4", name: "iPad Charging Port Flex Cable (USB-C)", sku: "PRT-IPAD-C", category: "Charging Ports", quantity: 8, costPrice: 8.50, sellPrice: 29.99, lowStockAt: 3, shop: "shop-1" },
  { _id: "inv-item-5", name: "USB-C to C Braided Cable 2m", sku: "ACC-USBC-2M", category: "Accessories", quantity: 25, costPrice: 4.00, sellPrice: 15.00, lowStockAt: 5, shop: "shop-1" },
  { _id: "inv-item-6", name: "Pixel 8 Pro Camera Lens Cover", sku: "LNS-PX8P-CVR", category: "Accessories", quantity: 1, costPrice: 3.50, sellPrice: 19.99, lowStockAt: 2, shop: "shop-2" }
];

export const defaultInvoices = [
  {
    _id: "inv-1",
    invoiceNumber: "INV-2026-0001",
    repair: "rep-5",
    customer: { name: "Diana Prince", phone: "555-321-7654" },
    parts: [
      { item: "inv-item-6", name: "Pixel 8 Pro Camera Lens Cover", quantity: 1, unitPrice: 19.99 }
    ],
    laborCost: 90.01,
    totalAmount: 110.00,
    paymentMode: "card",
    isPaid: true,
    paidAt: "2026-06-02T17:15:00.000Z",
    shop: "shop-2",
    notes: "Warranty of 90 days included."
  },
  {
    _id: "inv-2",
    invoiceNumber: "INV-2026-0002",
    repair: "rep-4",
    customer: { name: "Alice Johnson", phone: "555-123-4567" },
    parts: [
      { item: "inv-item-1", name: "iPhone 15 Pro OLED Screen", quantity: 1, unitPrice: 220.00 }
    ],
    laborCost: 130.00,
    totalAmount: 350.00,
    paymentMode: "upi",
    isPaid: false,
    paidAt: null,
    shop: "shop-1",
    notes: "Awaiting invoice settlement on device pick-up."
  }
];

export const initializeMockDB = () => {
  if (!localStorage.getItem("mobocare_seeded")) {
    localStorage.setItem("mobocare_shops", JSON.stringify(defaultShops));
    localStorage.setItem("mobocare_users", JSON.stringify(defaultUsers));
    localStorage.setItem("mobocare_customers", JSON.stringify(defaultCustomers));
    localStorage.setItem("mobocare_repairs", JSON.stringify(defaultRepairs));
    localStorage.setItem("mobocare_inventory", JSON.stringify(defaultInventoryItems));
    localStorage.setItem("mobocare_invoices", JSON.stringify(defaultInvoices));
    localStorage.setItem("mobocare_seeded", "true");
  }
};
