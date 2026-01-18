import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { getCMSContent, AboutPageContent } from "@/lib/actions/cms-actions";

export const metadata = {
    title: "About Us | Moolre Commerce",
    description: "Learn more about our story and mission.",
};

export default async function AboutPage() {
    const content = await getCMSContent<AboutPageContent>("about_page");

    // Fallback content if CMS is not seeded yet
    const data = content || {
        title: "About Us",
        description: "We are building the future of commerce.",
        storyTitle: "Our Story",
        storyContent: "Moolre Commerce started with a simple idea: premium quality should be accessible to everyone. We believe in sustainable sourcing, ethical production, and transparent pricing. Our team works directly with manufacturers to bring you the best products at fair prices.",
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
                        className="mb-8"
                        align="center"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">{data.storyTitle}</h2>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground" style={{ color: data.textColor !== "inherit" ? "inherit" : undefined, opacity: 0.9 }}>
                            <p className="whitespace-pre-wrap">{data.storyContent}</p>
                        </div>
                    </div>
                    {data.image ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-lg">
                            <img src={data.image} alt="About us" className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/50 flex items-center justify-center border-2 border-dashed">
                            <span className="text-muted-foreground">Add an image in CMS</span>
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
}
