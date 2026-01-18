import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { getCollections } from "@/lib/api";
import { getCMSContent, CollectionsPageContent } from "@/lib/actions/cms-actions";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "Collections | Moolre Commerce",
    description: "Browse all our collections.",
};

export default async function CollectionsPage() {
    const collections = await getCollections();
    const cmsContent = await getCMSContent<CollectionsPageContent>("collections_page");

    const data = cmsContent || {
        title: "All Collections",
        description: "Browse our complete range of categories.",
        backgroundColor: "transparent",
        textColor: "inherit"
    };

    return (
        <section className="py-12" style={{
            backgroundColor: data.backgroundColor !== "transparent" ? data.backgroundColor : undefined,
            color: data.textColor !== "inherit" ? data.textColor : undefined
        }}>
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <Heading
                        title={data.title}
                        description={data.description}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {collections.map((collection) => (
                        <Link
                            key={collection.id}
                            href={`/collections/${collection.slug}`}
                            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
                        >
                            {collection.image && (
                                <Image
                                    src={collection.image}
                                    alt={collection.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                                <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                                {collection.description && (
                                    <p className="text-white/80 line-clamp-2 mb-4 text-sm">{collection.description}</p>
                                )}
                                <span className="inline-flex items-center text-sm font-semibold">
                                    View Collection <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {collections.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No collections found.</p>
                    </div>
                )}
            </Container>
        </section>
    );
}
