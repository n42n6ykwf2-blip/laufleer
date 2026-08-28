export type LocalizedText = { de?: string; en?: string };

export type OpeningSlot = { open: string; close: string };
export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type OpeningHours = Partial<Record<WeekdayKey, OpeningSlot[]>>;

export type RestaurantFeature =
  | "terrace"
  | "vegan_options"
  | "family_friendly"
  | "wheelchair_accessible"
  | "bar"
  | "groups";

export const ALL_FEATURES: RestaurantFeature[] = [
  "terrace",
  "vegan_options",
  "family_friendly",
  "wheelchair_accessible",
  "bar",
  "groups",
];

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string | null;
  description: LocalizedText;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  neighborhood: string | null;
  country: string;
  phone: string | null;
  cover_image_url: string | null;
  opening_hours: OpeningHours;
  timezone: string;
  price_level: number | null;
  features: RestaurantFeature[];
  created_at: string;
  owner_id?: string | null;
  status?: RestaurantStatus;
  rejection_reason?: string | null;
  loyalty_enabled?: boolean;
  loyalty_points_per_visit?: number;
}

export type RestaurantStatus = "draft" | "pending" | "approved" | "rejected";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface LoyaltyAccount {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  created_at: string;
}

export interface LoyaltyBalance {
  account_id: string;
  restaurant_id: string;
  points: number;
  updated_at: string;
  loyalty_accounts?: LoyaltyAccount;
}

export interface LoyaltyTransaction {
  id: string;
  account_id: string;
  restaurant_id: string;
  reservation_id: string | null;
  points: number;
  kind: "earned" | "redeemed" | "adjusted";
  note: string | null;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: LocalizedText;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: LocalizedText;
  description: LocalizedText;
  price_cents: number;
  currency: string;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
}

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  label: string;
  capacity: number;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  party_size: number;
  reservation_at: string;
  duration_min: number;
  status: ReservationStatus;
  notes: string | null;
  created_at: string;
  restaurant_tables?: { label: string; capacity: number } | null;
}
