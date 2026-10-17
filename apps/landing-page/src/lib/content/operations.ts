import type { LucideIcon } from 'lucide-react'
import {
  Fish,
  Bird,
  Beef,
  Wheat,
  Milk,
  Salad,
  Droplets,
  Thermometer,
  Stethoscope,
  Wheat as Feed,
  Egg,
  ShieldCheck,
  Sprout,
  Recycle,
  CalendarRange,
  Snowflake,
  ClipboardCheck,
  Scissors,
  Package,
  FlaskConical,
  Users,
  Scale,
} from 'lucide-react'
import type { Tone } from '@/components/marketing'

export interface Operation {
  slug: string
  icon: LucideIcon
  tone: Tone
  title: string
  short: string
  intro: string
  highlights: string[]
  practices: { icon: LucideIcon; title: string; description: string }[]
  process: { title: string; description: string }[]
  products: string[]
  /** FarmProductCategory values to link into the shop */
  shopCategories: string[]
  /** Related operation in the other half of the chain */
  related?: { label: string; href: string }
}

export const farmingOperations: Operation[] = [
  {
    slug: 'aquaculture',
    icon: Fish,
    tone: 'blue',
    title: 'Fish Farming',
    short: 'Pond-raised tilapia and catfish, harvested to order.',
    intro:
      'Our fish ponds produce tilapia and catfish for families, restaurants and our own kitchens. Because we harvest close to delivery, fish reaches you fresher than market fish that has travelled for days.',
    highlights: ['Monitored ponds', 'Quality feed', 'Harvest to order', 'Cold chain'],
    practices: [
      { icon: Droplets, title: 'Water quality', description: 'Pond water is checked regularly and managed to keep fish healthy and growing well.' },
      { icon: Feed, title: 'Balanced feeding', description: 'Measured feeding schedules for steady growth and clean ponds.' },
      { icon: Stethoscope, title: 'Fish health', description: 'Stocking density and pond hygiene are managed to prevent disease rather than treat it.' },
      { icon: Snowflake, title: 'Straight onto ice', description: 'Harvested fish are cleaned, chilled and kept cold until delivery.' },
    ],
    process: [
      { title: 'Stocking', description: 'Fingerlings are stocked in prepared ponds.' },
      { title: 'Grow-out', description: 'Fish grow over several months with monitored feeding and water quality.' },
      { title: 'Harvest', description: 'Harvests are planned around orders and pre-orders.' },
      { title: 'Clean & chill', description: 'Fish are cleaned, packed and chilled for delivery or smoking.' },
    ],
    products: ['Fresh tilapia', 'Fresh catfish', 'Smoked fish', 'Bulk fish for restaurants'],
    shopCategories: ['FISH_SEAFOOD'],
    related: { label: 'Sardine processing', href: '/processing/sardine' },
  },
  {
    slug: 'poultry',
    icon: Bird,
    tone: 'amber',
    title: 'Poultry Farming',
    short: 'Broilers and layers raised with care — chicken and fresh eggs.',
    intro:
      'We raise broiler chickens for meat and layers for eggs. Clean housing, good feed and vaccination schedules keep our flocks healthy, and eggs are collected daily.',
    highlights: ['Daily egg collection', 'Vaccinated flocks', 'Clean housing', 'Graded eggs'],
    practices: [
      { icon: ShieldCheck, title: 'Biosecurity', description: 'Controlled access and hygiene routines protect flocks from disease.' },
      { icon: Stethoscope, title: 'Vaccination', description: 'Flocks follow a vaccination schedule from day one.' },
      { icon: Egg, title: 'Fresh eggs daily', description: 'Eggs are collected, checked and graded by size every day.' },
      { icon: Thermometer, title: 'Comfortable housing', description: 'Ventilated housing with space, clean water and good litter.' },
    ],
    process: [
      { title: 'Day-old chicks', description: 'Chicks are brooded under controlled temperature.' },
      { title: 'Rearing', description: 'Birds grow with balanced feed and regular health checks.' },
      { title: 'Collection & processing', description: 'Eggs are collected daily; broilers are processed hygienically.' },
      { title: 'Delivery', description: 'Eggs and chilled chicken go to customers, restaurants and the shop.' },
    ],
    products: ['Fresh farm eggs (by size)', 'Whole chicken', 'Chicken cuts', 'Trays and crates for businesses'],
    shopCategories: ['DAIRY_EGGS', 'LIVESTOCK_MEAT'],
    related: { label: 'Meat processing', href: '/processing/meat' },
  },
  {
    slug: 'livestock',
    icon: Beef,
    tone: 'red',
    title: 'Livestock',
    short: 'Cattle, goats and pigs for meat and dairy.',
    intro:
      'Our livestock operation raises cattle, goats and pigs for meat, and dairy cows for milk. Animals are well fed, watched by caretakers every day, and seen by veterinarians when needed.',
    highlights: ['Daily care', 'Veterinary checks', 'Traceable animals', 'Dairy herd'],
    practices: [
      { icon: Stethoscope, title: 'Animal health', description: 'Health records, deworming and vaccination for every animal.' },
      { icon: Sprout, title: 'Good nutrition', description: 'Grazing and supplementary feed suited to each animal.' },
      { icon: ClipboardCheck, title: 'Records', description: 'Each animal is identified, so meat and milk can be traced back.' },
      { icon: Users, title: 'Trained caretakers', description: 'Experienced herders who know their animals.' },
    ],
    process: [
      { title: 'Breeding & raising', description: 'Animals are bred or bought from verified farmers.' },
      { title: 'Health checks', description: 'Animals are checked before going to processing.' },
      { title: 'Processing', description: 'Hygienic slaughter and butchery in our meat processing unit.' },
      { title: 'Delivery', description: 'Chilled meat and fresh milk reach customers and kitchens.' },
    ],
    products: ['Beef', 'Goat meat', 'Pork', 'Fresh milk'],
    shopCategories: ['LIVESTOCK_MEAT', 'DAIRY_EGGS'],
    related: { label: 'Milk processing', href: '/processing/milk' },
  },
  {
    slug: 'crops',
    icon: Wheat,
    tone: 'green',
    title: 'Crop Farming',
    short: 'Vegetables, tubers, fruits and grains from our fields and partner farmers.',
    intro:
      'We grow vegetables, tubers, plantains and grains, and buy from verified smallholder farmers across Cameroon. Pre-orders tell us what to harvest, so less food goes to waste.',
    highlights: ['Seasonal produce', 'Partner farmers', 'Harvest to demand', 'Soil care'],
    practices: [
      { icon: Recycle, title: 'Crop rotation', description: 'Rotating crops and composting keeps soil fertile year after year.' },
      { icon: CalendarRange, title: 'Seasonal planning', description: 'Planting is planned around seasons and expected demand.' },
      { icon: Users, title: 'Farmer network', description: 'Verified partner farmers supply us — and are paid fairly and on time.' },
      { icon: Scale, title: 'Graded quality', description: 'Produce is sorted and graded before it reaches you.' },
    ],
    process: [
      { title: 'Planting', description: 'Planned by season and by what customers pre-order.' },
      { title: 'Growing', description: 'Fields are tended with careful use of inputs.' },
      { title: 'Harvest & sorting', description: 'Produce is harvested, cleaned and graded.' },
      { title: 'Delivery', description: 'Retail, bulk baskets and bags go out to homes and businesses.' },
    ],
    products: ['Tomatoes, peppers & onions', 'Cassava, yams & cocoyams', 'Plantains & fruits', 'Beans, maize & groundnuts'],
    shopCategories: ['FRESH_VEGETABLES', 'TUBERS', 'FRUITS', 'GRAINS_CEREALS'],
    related: { label: 'Vegetable processing', href: '/processing/vegetables' },
  },
]

export const processingFacilities: Operation[] = [
  {
    slug: 'sardine',
    icon: Fish,
    tone: 'blue',
    title: 'Sardine Processing',
    short: 'Cleaning, smoking and packing fish from coast and pond.',
    intro:
      'Our fish processing line cleans, smokes, dries and packs sardines and other fish, extending shelf life without losing flavour — so quality fish is available far from the coast.',
    highlights: ['Hygienic handling', 'Traditional smoking', 'Batch records', 'Sealed packs'],
    practices: [
      { icon: Snowflake, title: 'Kept cold', description: 'Fresh fish stays chilled from landing until it is processed.' },
      { icon: ClipboardCheck, title: 'Batch tracking', description: 'Each batch is recorded with its source, date and quantity.' },
      { icon: ShieldCheck, title: 'Hygiene first', description: 'Clean surfaces, protective gear and trained staff on every shift.' },
      { icon: Package, title: 'Sealed packing', description: 'Packed to protect freshness during storage and transport.' },
    ],
    process: [
      { title: 'Receiving', description: 'Fish is inspected and weighed on arrival.' },
      { title: 'Cleaning', description: 'Gutting, washing and sorting by size.' },
      { title: 'Smoking / drying', description: 'Smoked or dried to the right moisture level.' },
      { title: 'Packing', description: 'Weighed, sealed and labelled with its batch.' },
    ],
    products: ['Smoked sardines', 'Dried fish', 'Bulk packs for retailers'],
    shopCategories: ['FISH_SEAFOOD'],
    related: { label: 'Fish farming', href: '/farming/aquaculture' },
  },
  {
    slug: 'milk',
    icon: Milk,
    tone: 'indigo',
    title: 'Milk Processing',
    short: 'Pasteurised milk and dairy from our own herd.',
    intro:
      'Milk from our dairy cows is cooled quickly, tested and pasteurised, then bottled for delivery. Short distances from cow to bottle mean fresher, safer milk.',
    highlights: ['Fast cooling', 'Pasteurisation', 'Quality testing', 'Cold delivery'],
    practices: [
      { icon: Thermometer, title: 'Rapid cooling', description: 'Milk is cooled soon after milking to protect quality.' },
      { icon: FlaskConical, title: 'Tested', description: 'Each batch is checked before it is pasteurised and bottled.' },
      { icon: ShieldCheck, title: 'Pasteurised', description: 'Heat-treated to make it safe while keeping its taste.' },
      { icon: Snowflake, title: 'Cold chain', description: 'Stored and delivered chilled.' },
    ],
    process: [
      { title: 'Milking', description: 'Hygienic milking from our healthy herd.' },
      { title: 'Cooling & testing', description: 'Milk is chilled and checked.' },
      { title: 'Pasteurising', description: 'Heat-treated for safety.' },
      { title: 'Bottling', description: 'Bottled, dated and kept cold for delivery.' },
    ],
    products: ['Fresh pasteurised milk', 'Yoghurt', 'Dairy for restaurants and cafés'],
    shopCategories: ['DAIRY_EGGS'],
    related: { label: 'Livestock', href: '/farming/livestock' },
  },
  {
    slug: 'meat',
    icon: Beef,
    tone: 'red',
    title: 'Meat Processing',
    short: 'Hygienic butchery for beef, goat, pork and poultry.',
    intro:
      'Our meat unit handles animals from our own farms and verified farmers. Hygienic slaughter, careful butchery and chilled storage give you clean, well-cut meat you can trust.',
    highlights: ['Veterinary checks', 'Hygienic butchery', 'Clean cuts', 'Chilled storage'],
    practices: [
      { icon: Stethoscope, title: 'Inspected animals', description: 'Animals are checked for health before processing.' },
      { icon: ShieldCheck, title: 'Hygiene standards', description: 'Strict cleaning routines and protective equipment.' },
      { icon: Scissors, title: 'Skilled butchers', description: 'Consistent cuts for homes, restaurants and caterers.' },
      { icon: Snowflake, title: 'Chilled', description: 'Meat is chilled quickly and stays cold until delivery.' },
    ],
    process: [
      { title: 'Inspection', description: 'Health check and record of origin.' },
      { title: 'Processing', description: 'Hygienic slaughter and dressing.' },
      { title: 'Butchery', description: 'Cut, trimmed and portioned to order.' },
      { title: 'Packing', description: 'Packed, labelled and chilled.' },
    ],
    products: ['Beef cuts & minced beef', 'Goat meat', 'Pork', 'Chicken'],
    shopCategories: ['LIVESTOCK_MEAT'],
    related: { label: 'Livestock', href: '/farming/livestock' },
  },
  {
    slug: 'vegetables',
    icon: Salad,
    tone: 'green',
    title: 'Vegetable Processing',
    short: 'Sorting, washing, cutting and packing fresh produce.',
    intro:
      'Produce from our fields and partner farmers is sorted, washed and packed — and surplus is dried or prepared so good food is not wasted. Restaurants get prepared vegetables that save kitchen time.',
    highlights: ['Sorted & graded', 'Washed', 'Fresh-cut for kitchens', 'Less waste'],
    practices: [
      { icon: Scale, title: 'Grading', description: 'Sorted by size and quality so you get consistent produce.' },
      { icon: Droplets, title: 'Clean water washing', description: 'Washed to remove soil before packing.' },
      { icon: Recycle, title: 'Surplus to value', description: 'Extra produce is dried or prepared instead of thrown away.' },
      { icon: Package, title: 'Packed to protect', description: 'Baskets, bags and crates sized for homes and businesses.' },
    ],
    process: [
      { title: 'Receiving', description: 'Produce is inspected and weighed.' },
      { title: 'Sorting & washing', description: 'Graded and cleaned.' },
      { title: 'Preparing', description: 'Cut, dried or packed depending on the product.' },
      { title: 'Dispatch', description: 'Out to customers, restaurants and our kitchens.' },
    ],
    products: ['Graded fresh vegetables', 'Fresh-cut vegetables for restaurants', 'Dried produce', 'Bulk baskets & bags'],
    shopCategories: ['FRESH_VEGETABLES', 'LEAFY_GREENS', 'HERBS_SPICES'],
    related: { label: 'Crop farming', href: '/farming/crops' },
  },
]

export const categoryLabels: Record<string, string> = {
  LEAFY_GREENS: 'Leafy greens',
  ROOT_VEGETABLES: 'Root vegetables',
  FRUITS: 'Fruits',
  LEGUMES: 'Legumes',
  GRAINS_CEREALS: 'Grains & cereals',
  SEEDS_NUTS: 'Seeds & nuts',
  TUBERS: 'Tubers',
  HERBS_SPICES: 'Herbs & spices',
  FRESH_VEGETABLES: 'Fresh vegetables',
  DAIRY_EGGS: 'Dairy & eggs',
  LIVESTOCK_MEAT: 'Meat',
  FISH_SEAFOOD: 'Fish',
}
