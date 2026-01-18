"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/actions/media-actions";

interface ImageUploadProps {
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    currentImages?: string[];
}

export function ImageUpload({ onImagesChange, maxImages = 5, currentImages = [] }: ImageUploadProps) {
    const [images, setImages] = useState<string[]>(currentImages);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image`);
                    return null;
                }

                // Validate file size (4MB max to fit Vercel server action limit)
                if (file.size > 4 * 1024 * 1024) {
                    toast.error(`${file.name} is too large (max 4MB)`);
                    return null;
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'products');

                const result = await uploadMedia(formData);

                if (result.success && result.media) {
                    return result.media.url;
                }

                toast.error(`Failed to upload ${file.name}`);
                return null;
            });

            const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];

            if (uploadedUrls.length > 0) {
                const newImages = [...images, ...uploadedUrls];
                setImages(newImages);
                onImagesChange(newImages);
                toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
            }
        } catch (error) {
            toast.error("Upload failed");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    }, [images]);

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
    };

    const setCoverImage = (index: number) => {
        if (index === 0) return; // Already cover
        const newImages = [...images];
        const [cover] = newImages.splice(index, 1);
        newImages.unshift(cover);
        setImages(newImages);
        onImagesChange(newImages);
        toast.success("Cover image updated");
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-border"
                    } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            >
                <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleUpload(e.target.files)}
                    disabled={uploading || images.length >= maxImages}
                />

                <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Click to upload or drag and drop</p>
                                <p className="text-sm text-muted-foreground">
                                    PNG, JPG, GIF up to 4MB ({images.length}/{maxImages})
                                </p>
                            </div>
                        </>
                    )}
                </label>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border"
                        >
                            <img
                                src={url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Cover Badge */}
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                    Cover
                                </div>
                            )}

                            {/* Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {index !== 0 && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setCoverImage(index)}
                                    >
                                        <ImageIcon className="h-4 w-4 mr-1" />
                                        Set Cover
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {images.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    💡 Tip: The first image is your cover photo. Click "Set Cover" on any image to make it the cover.
                </p>
            )}
        </div>
    );
}
