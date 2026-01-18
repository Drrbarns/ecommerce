"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/actions/media-actions";

interface SingleImageUploadProps {
    onImageChange: (url: string | null) => void;
    currentImage?: string;
    folder?: string;
    label?: string;
}

export function SingleImageUpload({
    onImageChange,
    currentImage,
    folder = "uploads",
    label = "Featured Image"
}: SingleImageUploadProps) {
    const [image, setImage] = useState<string | null>(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        // Validate file size (4MB max)
        if (file.size > 4 * 1024 * 1024) {
            toast.error("Image must be less than 4MB");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const result = await uploadMedia(formData);

            if (result.success && result.media) {
                setImage(result.media.url);
                onImageChange(result.media.url);
                toast.success("Image uploaded!");
            } else {
                toast.error("Failed to upload image");
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
    }, []);

    const removeImage = () => {
        setImage(null);
        onImageChange(null);
    };

    return (
        <div className="space-y-2">
            {image ? (
                <div className="relative group">
                    <img
                        src={image}
                        alt={label}
                        className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={removeImage}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                    <input
                        type="file"
                        id={`image-upload-${folder}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleUpload(e.target.files)}
                        disabled={uploading}
                    />

                    <label
                        htmlFor={`image-upload-${folder}`}
                        className="cursor-pointer flex flex-col items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Click to upload or drag</p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG, GIF up to 4MB
                                    </p>
                                </div>
                            </>
                        )}
                    </label>
                </div>
            )}
        </div>
    );
}
