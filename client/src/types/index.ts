export interface MezmurListItem {
  id: number;
  title: string;
  difficulty: 'practice' | 'beginner' | 'intermediate' | 'advanced' | null;
  artist_name: string | null;
  tune_name: string | null;
  status?: 'approved' | 'pending' | 'rejected';
  contributor_name?: string | null;
}

export interface SequenceStep {
  step_order: number;
  line_number: number;
  duration_ms: number | null;
  string_id: number | null;
  group_id: number | null;
  string_position: number;
  note_name: string;
  audio_file_url: string;
  is_rest?: boolean;
  phrase_break?: boolean;
}

export interface MezmurDetail {
  id: number;
  title: string;
  lyrics: string | null;
  youtube_url: string | null;
  difficulty: 'practice' | 'beginner' | 'intermediate' | 'advanced' | null;
  artist_id: number | null;
  tune_id: number | null;
  artist_name: string | null;
  tune_name: string | null;
  tuning_profile_id: number | null;
  status?: 'approved' | 'pending' | 'rejected';
  contributor_name?: string | null;
  contributor_email?: string | null;
  approved_at?: string | null;
  sequence: SequenceStep[];
}

export interface AdminMezmurItem {
  id: number;
  title: string;
  difficulty: 'practice' | 'beginner' | 'intermediate' | 'advanced' | null;
  status: 'approved' | 'pending' | 'rejected';
  artist_name: string | null;
  tune_name: string | null;
  contributor_name: string | null;
  contributor_email: string | null;
  lyrics: string | null;
  youtube_url: string | null;
  step_count: string | number;
  created_at: string;
  approved_at: string | null;
}

export interface MezmurRequest {
  id: number;
  title: string;
  artist: string | null;
  youtube_url: string | null;
  notes: string | null;
  requester_name?: string | null;
  requester_email?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

export interface CreateMezmurPayload {
  title: string;
  artist?: string;
  tune?: string;
  difficulty?: 'practice' | 'beginner' | 'intermediate' | 'advanced';
  lyrics?: string;
  youtube_url?: string;
  raw_notation?: string;
  is_admin?: boolean;
  status?: 'approved' | 'pending';
  contributor_name?: string;
  contributor_email?: string;
}

export interface PendingMezmur {
  id: number;
  title: string;
  lyrics: string | null;
  youtube_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  artist_name: string | null;
  tune_name: string | null;
  status: 'pending';
  contributor_name: string | null;
  contributor_email: string | null;
  created_at: string;
}
