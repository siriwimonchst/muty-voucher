export interface User {
  id: string;
  phone_number: string;
  display_name: string;
  profile_picture_url: string;
  role: 'user' | 'admin';
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  shop_name: string;
  discount_type: 'percent' | 'fixed' | 'freebie';
  discount_value: number;
  total_quota: number;
  claimed_count: number;
  claim_start_time: string;
  claim_end_time: string;
  valid_until: string;
  image_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserVoucher {
  id: string;
  user_id: string;
  voucher_id: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED';
  claimed_at: string;
  used_at?: string;
  voucher_details: Voucher;
}
