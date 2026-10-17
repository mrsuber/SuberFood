import { Factory, Wheat } from 'lucide-react'
import type { SiteRegistryConfig } from './SiteRegistry'

export const farmsConfig: SiteRegistryConfig = {
  endpoint: '/api/admin/farms',
  noun: 'farm',
  types: ['AQUACULTURE', 'POULTRY', 'LIVESTOCK', 'CROPS'],
  statuses: ['ACTIVE', 'INACTIVE'],
  sizeField: 'size',
  sizeLabel: 'Total area',
  // Farm.size is documented in the schema as acres
  sizeUnit: 'acres',
  icon: Wheat,
}

export const facilitiesConfig: SiteRegistryConfig = {
  endpoint: '/api/admin/processing-facilities',
  noun: 'facility',
  types: ['SARDINE', 'MILK', 'MEAT', 'VEGETABLE', 'FRUIT', 'GRAIN'],
  statuses: ['OPERATIONAL', 'MAINTENANCE', 'CLOSED'],
  sizeField: 'capacity',
  sizeLabel: 'Daily capacity',
  sizeUnit: 'tons/day',
  icon: Factory,
}
