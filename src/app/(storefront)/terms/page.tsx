import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { getCMSContent, TermsPageContent } from "@/lib/actions/cms-actions";

export const metadata = {
    title: "Terms of Service | Moolre Commerce",
    description: "Our terms and conditions.",
};

export default async function TermsPage() {
    const content = await getCMSContent<TermsPageContent>("terms_page");

    const data = content || {
        title: "Terms of Service",
        lastUpdated: new Date().toLocaleDateString(),
        content: `
## 1. Introduction
Welcome to Moolre Commerce. By accessing our website, you agree to these terms and conditions.

## 2. Use of Site
You may not use our site for any illegal or unauthorized purpose.

## 3. Products
We try our best to display accurate colors and images of our products.

## 4. Limitation of Liability
We are not liable for any damages arising from your use of this site.
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
