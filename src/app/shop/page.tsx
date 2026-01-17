import { Suspense } from "react";
import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { getProducts, getCollections } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShopInterface } from "@/components/shop/shop-interface";

export const metadata = {
    title: "Shop All | Moolre Commerce",
    description: "Browse our comprehensive collection of premium essentials.",
};

export default async function ShopPage() {
    const [products, collections] = await Promise.all([
        getProducts(),
        getCollections(),
    ]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12">
                <Container>
                    <Heading
                        title="All Products"
                        description="Meticulously crafted for your lifestyle."
                        className="mb-8"
                    />

                    <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-xl" />}>
                        <ShopInterface
                            initialProducts={products}
                            collections={collections}
                        />
                    </Suspense>
                </Container>
            </main>
            <Footer />
        </div>
    );
}
