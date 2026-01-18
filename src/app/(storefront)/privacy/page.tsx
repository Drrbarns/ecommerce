import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { getCMSContent, PrivacyPageContent } from "@/lib/actions/cms-actions";

export const metadata = {
    title: "Privacy Policy | Moolre Commerce",
    description: "How we handle your data.",
};

export default async function PrivacyPage() {
    const content = await getCMSContent<PrivacyPageContent>("privacy_page");

    const data = content || {
        title: "Privacy Policy",
        lastUpdated: new Date().toLocaleDateString(),
        content: `
## 1. Information We Collect
We collect information you provide directly to us when you make a purchase or contact us.

## 2. How We Use Information
We use your information to fulfill your orders and send you updates.

## 3. Data Protection
We implement security measures to maintain the safety of your personal information.
        `,
        backgroundColor: "transparent",
        textColor: "inherit"
    };

    return (
        <section className="py-12" style={{
            backgroundColor: data.backgroundColor !== "transparent" ? data.backgroundColor : undefined,
            color: data.textColor !== "inherit" ? data.textColor : undefined
        }}>
            <Container>
                <div className="max-w-4xl mx-auto">
                    <Heading
                        title={data.title}
                        description={`Last updated: ${data.lastUpdated}`}
                        className="mb-12 border-b pb-8"
                    />

                    <div className="prose dark:prose-invert max-w-none" style={{ color: "inherit" }}>
                        <div className="whitespace-pre-wrap font-sans">{data.content}</div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
