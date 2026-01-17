"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { useRouter } from "next/navigation";

export function MediaUploadButton() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleUploadComplete = () => {
        setOpen(false);
        router.refresh();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Media</DialogTitle>
                    <DialogDescription>
                        Upload images to your media library.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ImageUpload
                        onImagesChange={handleUploadComplete}
                        maxImages={10}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
