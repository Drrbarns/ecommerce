import { Suspense } from "react";
import { getMediaLibrary } from "@/lib/actions/media-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MediaGrid } from "./media-grid";
import { MediaUploadButton } from "./media-upload-button";
import { Image as ImageIcon, Folder } from "lucide-react";

export default async function MediaLibraryPage() {
    const { media } = await getMediaLibrary({ limit: 50 });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                    <p className="text-muted-foreground">
                        Manage your images and files.
                    </p>
                </div>
                <MediaUploadButton />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        All Media ({media.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Loading media...</div>}>
                        <MediaGrid initialMedia={media} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
