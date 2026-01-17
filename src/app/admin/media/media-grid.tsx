"use client";

import { useState } from "react";
import { Copy, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia } from "@/lib/actions/media-actions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaItem {
    id: string;
    url: string;
    filename: string;
    mime_type?: string;
}

export function MediaGrid({ initialMedia }: { initialMedia: any[] }) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("URL copied to clipboard");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        const result = await deleteMedia(id);
        if (result.success) {
            setMediaItems(mediaItems.filter((item) => item.id !== id));
            toast.success("File deleted");
        } else {
            toast.error(result.error || "Failed to delete file");
        }
    };

    if (mediaItems.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No media files found. Upload some!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaItems.map((item) => (
                <div key={item.id} className="group relative aspect-square border rounded-lg overflow-hidden bg-muted/20">
                    <img
                        src={item.url}
                        alt={item.filename}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyUrl(item.url)}
                            title="Copy URL"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Confirm Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.filename.split('/').pop()}
                    </div>
                </div>
            ))}
        </div>
    );
}
