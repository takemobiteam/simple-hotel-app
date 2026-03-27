export interface Hotel {
  propertyId: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  stateCode: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  starRating: number;
  guestRating: number | null;
  reviewCount: number;
  lowestRate: number | null;
  currency: string;
  imageUrls: string[];
}
