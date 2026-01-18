import { notFound } from "next/navigation";

import { Container } from "@/components/shared/container";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductCard } from "@/components/shared/product-card";
import { Heading } from "@/components/shared/heading";
import { getProductBySlug, getProducts } from "@/lib/api";

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    const products = await getProducts();
    return products.map((product) => ({
        slug: product.slug,
    }));
}

export async function generateMetadata({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: "Product Not Found",
        };
    }

    return {
        title: `${product.name} | Moolre Commerce`,
        description: `Buy ${product.name} online. Premium quality.`,
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    // Ideally use data fetching for related products too
    const allProducts = await getProducts();
    const relatedProducts = allProducts
        .filter((p) => p.id !== product.id)
        .slice(0, 4);

    return (
        <section className="py-12">
            <Container>
                {/* Breadcrumb could go here */}

                <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
                    <ProductGallery product={product} />
                    <ProductInfo product={product} />
                </div>

                {/* Related Products */}
                <div className="mt-24">
                    <Heading
                        title="You May Also Like"
                        className="mb-10"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {relatedProducts.map((related) => (
                            <ProductCard key={related.id} product={related} />
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
