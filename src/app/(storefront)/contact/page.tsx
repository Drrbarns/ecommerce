import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { getCMSContent, ContactPageContent } from "@/lib/actions/cms-actions";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata = {
    title: "Contact Us | Moolre Commerce",
    description: "Get in touch with our team.",
};

export default async function ContactPage() {
    const content = await getCMSContent<ContactPageContent>("contact_page");

    const data = content || {
        title: "Contact Us",
        subtitle: "We'd love to hear from you. Get in touch with us for any questions or support.",
        email: "support@moolre.com",
        phone: "+1 (555) 123-4567",
        address: "123 Commerce St, Tech City, TC 90210",
        hours: "Mon-Fri: 9am - 5pm EST",
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
                        description={data.subtitle}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Contact Info */}
                    <div className="grid gap-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                                <p className="text-muted-foreground mb-2">For general inquiries and support.</p>
                                <a href={`mailto:${data.email}`} className="text-primary hover:underline font-medium">{data.email}</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Call Us</h3>
                                <p className="text-muted-foreground mb-2">Mon-Fri from 9am to 6pm.</p>
                                <a href={`tel:${data.phone}`} className="text-primary hover:underline font-medium">{data.phone}</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Visit Us</h3>
                                <p className="text-muted-foreground mb-2">Come say hello at our office.</p>
                                <p className="font-medium">{data.address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Business Hours</h3>
                                <p className="text-muted-foreground mb-2">When we are available.</p>
                                <p className="font-medium">{data.hours}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div className="rounded-2xl border bg-card p-8 shadow-sm text-card-foreground">
                        <h3 className="text-xl font-bold mb-6">Send us a message</h3>
                        <form className="space-y-4">
                            <div className="grid gap-2">
                                <label htmlFor="name" className="text-sm font-medium">Name</label>
                                <input type="text" id="name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Your name" />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <input type="email" id="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="name@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <textarea id="message" className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="How can we help you?" />
                            </div>
                            <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </Container>
        </section>
    );
}
