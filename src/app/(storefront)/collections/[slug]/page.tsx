import { notFound } from "next/navigation";
import { getCollectionBySlug, getProductsByCollection } from "@/lib/api";
import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CollectionPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
    const { slug } = await params;
    const collection = await getCollectionBySlug(slug);
    if (!collection) return { title: "Collection Not Found" };
    return {
        title: `${collection.name} | Collections`,
        description: collection.description,
    };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { slug } = await params;
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
        notFound();
    }

    const products = await getProductsByCollection(slug);

    return (
        <section className="py-12">
            <Container>
                <div className="mb-8">
                    <Button variant="ghost" size="sm" asChild className="mb-4 text-muted-foreground hover:text-foreground">
                        <Link href="/collections">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Collections
                        </Link>
                    </Button>
                    <Heading
                        title={collection.name}
                        description={collection.description}
                    />
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/30 rounded-xl border border-dashed">
                        <p className="text-muted-foreground mb-4">No products found in this collection yet.</p>
                        <Button asChild>
                            <Link href="/shop">Browse All Products</Link>
                        </Button>
                    </div>
                )}
            </Container>
        </section>
    );
}
