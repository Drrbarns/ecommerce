import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
    title: "Careers | Moolre Commerce",
    description: "Join our team and help shape the future of e-commerce in Africa.",
};

export default function CareersPage() {
    return (
        <section className="py-12">
            <Container>
                <div className="text-center mb-12">
                    <Heading
                        title="Careers at Moolre"
                        description="Join our mission to revolutionize e-commerce in Africa."
                        align="center"
                    />
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="text-center py-16 px-6 rounded-2xl border bg-muted/30">
                        <h2 className="text-2xl font-bold mb-4">No Open Positions</h2>
                        <p className="text-muted-foreground mb-6">
                            We don't have any open positions at the moment, but we're always looking for talented individuals.
                            Send us your resume and we'll keep you in mind for future opportunities.
                        </p>
                        <Button asChild>
                            <Link href="mailto:careers@moolre.com">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Resume
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
                        <div>
                            <h3 className="font-bold text-4xl text-primary mb-2">10+</h3>
                            <p className="text-muted-foreground">Team Members</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-4xl text-primary mb-2">Remote</h3>
                            <p className="text-muted-foreground">First Company</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-4xl text-primary mb-2">GH</h3>
                            <p className="text-muted-foreground">Headquarters</p>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
