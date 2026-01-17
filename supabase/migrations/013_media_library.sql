-- Migration 013: Media Library
-- Centralized media upload management system

CREATE TABLE IF NOT EXISTS public.media_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  uploaded_by UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  filename TEXT NOT NULL, -- Storage path
  original_filename TEXT NOT NULL, -- User's original filename
  url TEXT NOT NULL, -- Full public URL
  thumbnail_url TEXT, -- Optional thumbnail for images
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- Bytes
  width INTEGER, -- For images
  height INTEGER, -- For images
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  folder TEXT DEFAULT 'general' -- Organizational folder
);

-- RLS for media uploads
ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;

-- Everyone can view media
CREATE POLICY "Media viewable by everyone" ON public.media_uploads 
  FOR SELECT USING (true);

-- Only service role can manage media
CREATE POLICY "Media manageable by service role" ON public.media_uploads 
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_media_folder ON public.media_uploads(folder);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON public.media_uploads(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_tags ON public.media_uploads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_created ON public.media_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.media_uploads(uploaded_by);

-- Function to generate friendly filename
CREATE OR REPLACE FUNCTION generate_media_filename(original_name TEXT)
RETURNS TEXT AS $$
DECLARE
  extension TEXT;
  base_name TEXT;
  timestamp_str TEXT;
BEGIN
  -- Extract extension
  extension := substring(original_name from '\.([^\.]+)$');
  
  -- Generate timestamp-based name
  timestamp_str := to_char(now(), 'YYYYMMDD_HH24MISS');
  
  -- Generate random suffix
  base_name := substring(md5(random()::text), 1, 8);
  
  RETURN format('%s_%s.%s', timestamp_str, base_name, extension);
END;
$$ LANGUAGE plpgsql;
