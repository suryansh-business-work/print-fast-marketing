export interface ICampaignWeek {
  weekNumber: number;
  inHomesWeekOf: string;
  mailingQuantity: number;
  totalPayments: number;
  productService: string | null;
}

export interface ICampaignListItem {
  campaignId: string;
  vendorName: string;
  vendorId: string;
  name: string;
  description: string;
  currentProduct: string;
  totalMailingQuantity: number;
  totalWeeks: number;
  startDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface ICampaignDetail {
  campaignId: string;
  vendor: {
    vendorId: string;
    name: string;
  };
  name: string;
  description: string;
  currentProduct: string;
  totalMailingQuantity: number;
  totalWeeks: number;
  startDate: string;
  paymentDay: string;
  nextScheduledProduct: string;
  nextScheduledArtworkDueDate: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  postcardImageUrl: string;
  weeks: ICampaignWeek[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCampaignPayload {
  vendor: string;
  name: string;
  description?: string;
  currentProduct: string;
  totalMailingQuantity: number;
  totalWeeks: number;
  startDate: string;
  paymentDay: string;
  nextScheduledProduct?: string;
  nextScheduledArtworkDueDate?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface IUpdateCampaignPayload {
  name?: string;
  description?: string;
  currentProduct?: string;
  totalMailingQuantity?: number;
  totalWeeks?: number;
  startDate?: string;
  paymentDay?: string;
  nextScheduledProduct?: string;
  nextScheduledArtworkDueDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export const PAYMENT_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const PRODUCT_OPTIONS = [
  'Plastic Postcard Medium 4.5 x 7',
  'Oversized Postcard 5.5 x 10.5',
  'Standard Postcard 4 x 6',
  'Jumbo Postcard 6 x 11',
  'Tri-Fold Mailer',
  'Bi-Fold Mailer',
] as const;
