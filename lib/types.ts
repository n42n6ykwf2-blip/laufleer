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
  loyalty_threshold?: number;
  loyalty_discount_percent?: number;
}

export type RewardStatus = "active" | "redeemed" | "expired" | "cancelled";

export interface LoyaltyReward {
  id: string;
  account_id: string;
  restaurant_id: string;
  code: string;
  discount_percent: number;
  points_spent: number;
  status: RewardStatus;
  expires_at: string | null;
  redeemed_at: string | null;
  created_at: string;
  restaurants?: { name: string; slug: string } | null;
  loyalty_accounts?: { name: string | null; email: string } | null;
}

export type RestaurantStatus = "draft" | "pending" | "approved" | "rejected";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Customer {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  loyalty_account_id: string | null;
  created_at: string;
  updated_at: string;
}

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
