"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadMediaInput {
    file: File;
    folder?: string;
    altText?: string;
    tags?: string[];
    staffId?: string;
}

interface MediaFilters {
    folder?: string;
    tags?: string[];
    mimeType?: string;
    limit?: number;
    offset?: number;
}

/**
 * Upload media to Supabase Storage and create database record
 */
export async function uploadMedia(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'general';
        const altText = formData.get('altText') as string;
        const tagsStr = formData.get('tags') as string;
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const filename = `${folder}/${timestamp}_${randomStr}.${extension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('products')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return { success: false, error: uploadError.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filename);

        // Create media record in database
        const { data: media, error: dbError } = await supabase
            .from('media_uploads')
            .insert({
                filename,
                original_filename: file.name,
                url: publicUrl,
                mime_type: file.type,
                file_size: file.size,
                alt_text: altText || null,
                tags: tags.length > 0 ? tags : null,
                folder,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // Try to clean up uploaded file
            await supabase.storage.from('products').remove([filename]);
            return { success: false, error: dbError.message };
        }

        revalidatePath('/admin/media');
        return {
            success: true,
            media: {
                id: media.id,
                url: media.url,
                filename: media.filename,
            },
        };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Failed to upload media' };
    }
}

/**
 * Get media library with filters
 */
export async function getMediaLibrary(filters?: MediaFilters) {
    let query = supabase
        .from('media_uploads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (filters?.folder) {
        query = query.eq('folder', filters.folder);
    }

    if (filters?.mimeType) {
        query = query.like('mime_type', `${filters.mimeType}%`);
    }

    if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching media:', error);
        return { media: [], count: 0 };
    }

    return { media: data || [], count: count || 0 };
}

/**
 * Get media by ID
 */
export async function getMediaById(id: string) {
    const { data, error } = await supabase
        .from('media_uploads')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching media:', error);
        return null;
    }

    return data;
}

/**
 * Update media metadata
 */
export async function updateMediaMetadata(
    id: string,
    updates: { altText?: string; caption?: string; tags?: string[]; folder?: string }
) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (updates.altText !== undefined) updateData.alt_text = updates.altText;
    if (updates.caption !== undefined) updateData.caption = updates.caption;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.folder !== undefined) updateData.folder = updates.folder;

    const { error } = await supabase
        .from('media_uploads')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating media:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/media');
    return { success: true };
}

/**
 * Delete media (removes from storage and database)
 */
export async function deleteMedia(id: string) {
    // Get media record to find filename
    const { data: media } = await supabase
        .from('media_uploads')
        .select('filename')
        .eq('id', id)
        .single();

    if (!media) {
        return { success: false, error: 'Media not found' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('products')
        .remove([media.filename]);

    if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue anyway to clean up database
    }

    // Delete from database
    const { error: dbError } = await supabase
        .from('media_uploads')
        .delete()
        .eq('id', id);

    if (dbError) {
        console.error('Database deletion error:', dbError);
        return { success: false, error: dbError.message };
    }

    revalidatePath('/admin/media');
    return { success: true };
}

/**
 * Get unique folders
 */
export async function getMediaFolders() {
    const { data, error } = await supabase
        .from('media_uploads')
        .select('folder')
        .order('folder');

    if (error) {
        console.error('Error fetching folders:', error);
        return { folders: ['general'] };
    }

    const uniqueFolders = [...new Set(data.map(m => m.folder))];
    return { folders: uniqueFolders };
}

/**
 * Get unique tags
 */
export async function getMediaTags() {
    const { data, error } = await supabase
        .from('media_uploads')
        .select('tags');

    if (error) {
        console.error('Error fetching tags:', error);
        return { tags: [] };
    }

    const allTags = data.flatMap(m => m.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return { tags: uniqueTags };
}
