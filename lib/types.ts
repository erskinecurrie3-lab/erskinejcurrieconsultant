// Core Type Definitions for Erskine J Currie Ministry Platform

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'client';
}

export interface Church {
  id: number;
  name: string;
  pastor_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  size?: string;
  status: 'active' | 'inactive' | 'prospect';
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  church_name?: string;
  role: 'senior_pastor' | 'worship_pastor' | 'church_planter';
  stage: 'inquiry' | 'consultation' | 'proposal' | 'active' | 'completed' | 'lost';
  source: 'website' | 'referral' | 'event' | 'social' | 'resource_download';
  score: number;
  lead_score?: number;
  tags?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: number;
  church_id: number;
  title: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
  progress: number;
  budget?: number;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Assessment {
  id: number;
  church_id: number;
  title: string;
  category: 'worship' | 'leadership' | 'systems' | 'growth' | 'community';
  score: number;
  responses: string;
  recommendations?: string;
  completed_at?: string;
  user_id: string;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: 'workshop' | 'cohort' | 'webinar' | 'conference';
  start_date: string;
  end_date?: string;
  location?: string;
  capacity?: number;
  price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Registration {
  id: number;
  event_id: number;
  church_id?: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_amount: number;
  stripe_session_id?: string;
  attended: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Resource {
  id: number;
  title: string;
  description?: string;
  category: 'guide' | 'template' | 'checklist' | 'video' | 'ebook';
  file_url?: string;
  thumbnail_url?: string;
  preview_url?: string;
  downloads: number;
  is_gated: boolean;
  topic?: string;
  audience?: string;
  tags?: string;
  created_at: string;
  updated_at?: string;
}

export interface ResourceDownload {
  id: number;
  resource_id: number;
  resource_title: string;
  user_email: string;
  download_timestamp: string;
  source: 'direct' | 'gated';
}

export interface Message {
  id: number;
  church_id: number;
  sender_type: 'admin' | 'client';
  subject?: string;
  content: string;
  read: boolean;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: number;
  lead_id?: number;
  church_id?: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Proposal {
  id: number;
  lead_id?: number;
  church_id?: number;
  title: string;
  content?: string;
  services?: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  sent_at?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface KPIData {
  total_leads: number;
  active_clients: number;
  monthly_revenue: number;
  conversion_rate: number;
  upcoming_events: number;
  pending_tasks: number;
}

export interface PipelineMetrics {
  inquiry: number;
  consultation: number;
  proposal: number;
  active: number;
  completed: number;
  lost: number;
}