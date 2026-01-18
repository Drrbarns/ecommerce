import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPosts } from "@/lib/actions/feature-actions";

export const metadata = {
    title: "Blog | Moolre Commerce",
    description: "Latest news, updates, and insights from our store.",
};

export default async function BlogPage() {
    const posts = await getBlogPosts({ status: 'published' });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary/5 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Latest news, product updates, and insights from our team.
                    </p>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="container mx-auto px-4 py-12">
                {posts.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post: any) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                                    {post.featured_image && (
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={post.featured_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="text-muted-foreground line-clamp-3 mb-4">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <span className="inline-flex items-center text-primary text-sm font-medium">
                                            Read More
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold mb-4">No Posts Yet</h2>
                        <p className="text-muted-foreground mb-8">
                            Check back soon for our latest updates and articles.
                        </p>
                        <Link href="/" className="text-primary hover:underline">
                            ← Back to Store
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
