export const STAFF_ROLES = ['CHEF', 'SOUS_CHEF', 'LINE_COOK', 'WAITER', 'HOST', 'DELIVERY_DRIVER', 'MANAGER', 'CASHIER']
export const STAFF_STATUSES = ['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED']
export const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

/** Staff.workSchedule is stored as { monday: ["09:00-17:00"], ... } */
export type WorkSchedule = Partial<Record<(typeof WEEK_DAYS)[number], string[]>>
