import Link from "next/link";
import { PenLine, Plus, Calendar, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBlogPosts } from "@/lib/actions/feature-actions";

export default async function AdminBlogPage() {
    const posts = await getBlogPosts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog & Content</h1>
                    <p className="text-muted-foreground">
                        Manage your blog posts and content.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/blog/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Post
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {posts.length > 0 ? (
                    posts.map((post: any) => (
                        <Card key={post.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{post.title}</h3>
                                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                                {post.status}
                                            </Badge>
                                        </div>
                                        {post.excerpt && (
                                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <PenLine className="h-4 w-4" />
                                                {post.author_email || 'Admin'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {post.status === 'published' && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/blog/${post.slug}`} target="_blank">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/blog/${post.id}`}>
                                                Edit
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <PenLine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Blog Posts Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start creating content to engage your customers.
                            </p>
                            <Button asChild>
                                <Link href="/admin/blog/new">Create Your First Post</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
