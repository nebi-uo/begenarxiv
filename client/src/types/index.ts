export interface MezmurListItem {
  id: number;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  artist_name: string | null;
  tune_name: string | null;
}

export interface SequenceStep {
  step_order: number;
  line_number: number;
  duration_ms: number | null;
  string_id: number;
  group_id: number | null
  string_position: number;
  note_name: string;
  audio_file_url: string;
}

export interface MezmurDetail {
  id: number;
  title: string;
  lyrics: string | null;
  youtube_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  artist_id: number | null;
  tune_id: number | null;
  artist_name: string | null;
  tune_name: string | null;
  tuning_profile_id: number | null;
  sequence: SequenceStep[];
}