import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/actions/feature-actions";

export async function generateStaticParams() {
    const posts = await getBlogPosts({ status: 'published' });
    return posts.map((post: any) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    return {
        title: `${post.title} | Moolre Blog`,
        description: post.excerpt || post.content.slice(0, 160),
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.featured_image ? [post.featured_image] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post || post.status !== 'published') {
        notFound();
    }

    return (
        <article className="min-h-screen bg-background">
            {/* Header */}
            {post.featured_image && (
                <div className="w-full h-[400px] relative">
                    <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Back Link */}
                <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                </Link>

                {/* Title & Meta */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        {post.author_email && (
                            <span>By {post.author_email}</span>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                    {post.content.split('\n').map((paragraph: string, i: number) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>

                {/* Share */}
                <div className="mt-12 pt-8 border-t">
                    <div className="flex items-center justify-between">
                        <Link href="/blog" className="text-primary hover:underline">
                            ← More Articles
                        </Link>
                        <Button variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}
