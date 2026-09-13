export interface Mezmur {
  id: number;
  title: string;
  lyrics: string | null;
  youtube_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  artist_id: number | null;
  tune_id: number | null;
  tuning_profile_id: number | null;
}

export interface SequenceStep {
  step_order: number;
  line_number: number;
  duration_ms: number | null;
  string_id: number;
  string_position: number;
  note_name: string;
  audio_file_url: string;
}

export interface MezmurWithSequence extends Mezmur {
  artist_name: string | null;
  tune_name: string | null;
  sequence: SequenceStep[];
}

export interface Artist {
  id: number;
  name: string;
}

export interface Tune {
  id: number;
  name: string;
}

export interface TuningProfileNote {
  string_id: number;
  note_name: string;
  frequency_hz: number;
  audio_file_url: string;
}

export interface TuningProfileWithNotes {
  id: number;
  name: string;
  description: string | null;
  notes: TuningProfileNote[];
}