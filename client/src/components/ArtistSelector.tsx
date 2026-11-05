import React, { useEffect, useState, useMemo } from 'react';
import { Tag, Plus, Check, ChevronDown } from 'lucide-react';
import { api } from '../api/client';
import type { ArtistItem } from '../types';

interface ArtistSelectorProps {
  value: string;
  onChange: (artistName: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  helperText?: string;
}

export default function ArtistSelector({
  value,
  onChange,
  label = 'Artist / Performer Tag',
  required = false,
  placeholder = 'e.g. Alemu Aga or Traditional',
  className = '',
  helperText,
}: ArtistSelectorProps) {
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewMode, setIsNewMode] = useState(false);

  const fetchArtists = () => {
    setLoading(true);
    api.getArtists()
      .then((data) => {
        // Filter out empty names
        const valid = data.filter((a) => a.name && a.name.trim().length > 0);
        setArtists(valid);
        // If current value is set and doesn't match any existing artist, or if list is empty
        if (valid.length === 0) {
          setIsNewMode(true);
        } else if (value && !valid.some((a) => a.name.toLowerCase() === value.trim().toLowerCase())) {
          setIsNewMode(true);
        } else if (!value) {
          setIsNewMode(false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  // When value changes from parent (e.g., editing a hymn), sync mode
  useEffect(() => {
    if (artists.length > 0 && value) {
      const match = artists.find((a) => a.name.toLowerCase() === value.trim().toLowerCase());
      if (match) {
        setIsNewMode(false);
      }
    }
  }, [value, artists]);

  // Check if typed new name matches an existing artist tag
  const matchingExistingArtist = useMemo(() => {
    if (!isNewMode || !value.trim()) return null;
    const lower = value.trim().toLowerCase();
    return artists.find((a) => a.name.toLowerCase() === lower);
  }, [isNewMode, value, artists]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__NEW__') {
      setIsNewMode(true);
      onChange('');
    } else {
      setIsNewMode(false);
      onChange(selected);
    }
  };

  const handleSwitchToNew = () => {
    setIsNewMode(true);
    onChange('');
  };

  const handleSwitchToSelect = () => {
    setIsNewMode(false);
    if (artists.length > 0) {
      // Pick first or previous matching
      const currentMatch = artists.find((a) => a.name.toLowerCase() === value.trim().toLowerCase());
      onChange(currentMatch ? currentMatch.name : artists[0].name);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Mode Switch Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-mono font-medium text-zinc-700">
            {label} {required && <span className="text-black font-bold">*</span>}
          </label>
          {loading && <span className="text-[10px] font-mono text-zinc-400">Loading tags...</span>}
        </div>

        {artists.length > 0 && (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {isNewMode ? (
              <button
                type="button"
                onClick={handleSwitchToSelect}
                className="text-zinc-600 hover:text-black hover:underline cursor-pointer flex items-center gap-1"
                title="Select from existing catalogue artist tags"
              >
                <Tag size={11} /> Choose Existing Tag ({artists.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSwitchToNew}
                className="text-zinc-600 hover:text-black hover:underline cursor-pointer flex items-center gap-1"
                title="Add a brand new artist to the archive"
              >
                <Plus size={11} /> + New Artist Tag
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Input Control */}
      {!isNewMode && artists.length > 0 ? (
        <div className="space-y-1.5">
          <div className="relative">
            <select
              value={value}
              onChange={handleSelectChange}
              required={required}
              className="w-full px-3 py-2 pr-8 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm bg-white cursor-pointer appearance-none"
            >
              <option value="">-- Choose Artist Tag from Catalogue --</option>
              {artists.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} {a.mezmur_count ? `(${a.mezmur_count} hymn${a.mezmur_count > 1 ? 's' : ''})` : ''}
                </option>
              ))}
              <option value="__NEW__">+ Add New Artist Tag...</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
          </div>

          {/* Tag Confirmation Badge */}
          {value ? (
            <div className="flex items-center justify-between text-[11px] font-mono bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded">
              <span className="flex items-center gap-1.5 text-zinc-800 font-medium">
                <Tag size={11} className="text-black" />
                <span>Selected Tag:</span>
                <strong className="text-black bg-zinc-200 px-1.5 py-0.2 rounded font-sans text-xs">
                  {value}
                </strong>
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                Catalogue Tag
              </span>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-zinc-400">
              Select an artist tag or click &quot;+ New Artist Tag&quot; to add someone new.
            </p>
          )}
        </div>
      ) : (
        /* New Artist Text Input Mode */
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="text"
              required={required}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm bg-white"
            />
          </div>

          {/* Dynamic Helper / Match Detection */}
          {matchingExistingArtist ? (
            <div className="flex items-center justify-between text-[11px] font-mono bg-zinc-100 border border-black p-2 rounded">
              <span className="text-black font-medium flex items-center gap-1.5">
                <Check size={12} className="text-black" />
                <span>Matches existing tag:</span>
                <strong className="underline underline-offset-2">{matchingExistingArtist.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  onChange(matchingExistingArtist.name);
                  setIsNewMode(false);
                }}
                className="px-2 py-0.5 rounded bg-black text-white hover:bg-zinc-800 text-[10px] font-bold cursor-pointer"
              >
                Use Saved Tag
              </button>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-zinc-400">
              {helperText ||
                (artists.length === 0
                  ? 'No artists in catalogue yet. Type artist name — will be saved into dropdown upon publish.'
                  : 'New artist tag will be saved into the dropdown menu for future mezmurs.')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
