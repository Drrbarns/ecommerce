import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCMSContent, HeroContent } from "@/lib/actions/cms-actions";

// Default hero content (used when CMS is not set up)
const defaultHero: HeroContent = {
    title: "Redefine Your Style.",
    subtitle: "Premium essentials designed for the modern minimalist. Uncompromising quality, effortless elegance.",
    badge: "New Season 2026",
    primaryButtonText: "Shop Now",
    primaryButtonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about",
    backgroundImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop",
    overlayOpacity: 0.3,
    backgroundColor: "#0B1220",
    cardBackgroundColor: "#18181b",
    textColor: "#FFFFFF",
    subtitleColor: "#a1a1aa",
};

export async function Hero() {
    // Fetch CMS content, fall back to defaults
    const cmsHero = await getCMSContent<HeroContent>("hero");
    const hero = cmsHero || defaultHero;

    return (
        <section
            className="w-full px-4 pt-20 md:px-6 md:pt-24 lg:px-8 lg:pt-28 pb-12"
            style={{ backgroundColor: hero.backgroundColor || '#0B1220' }}
        >
            <div
                className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl max-w-[1440px] mx-auto"
                style={{ backgroundColor: hero.cardBackgroundColor || '#18181b' }}
            >
                <div className="grid md:grid-cols-2 min-h-[600px] md:min-h-[700px]">

                    {/* Left: Text Content */}
                    <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-8 sm:py-16 md:px-16 lg:px-24">
                        <div>
                            {hero.badge && (
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white backdrop-blur-xl">
                                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                                    {hero.badge}
                                </span>
                            )}
                        </div>

                        <h1
                            className="mt-6 font-heading text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05] sm:leading-[0.95]"
                            style={{ color: hero.textColor || '#FFFFFF' }}
                        >
                            {hero.title.split('\n').map((line, i) => (
                                <span key={i}>
                                    {line}
                                    {i < hero.title.split('\n').length - 1 && <br />}
                                </span>
                            ))}
                        </h1>

                        <p
                            className="mt-6 max-w-md text-lg"
                            style={{ color: hero.subtitleColor || '#a1a1aa' }}
                        >
                            {hero.subtitle}
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            {hero.primaryButtonText && (
                                <Button
                                    size="lg"
                                    className="h-14 rounded-full border-2 border-white/30 bg-white/10 px-8 text-base font-semibold text-white hover:bg-white/20 hover:border-white/50"
                                    asChild
                                >
                                    <Link href={hero.primaryButtonLink || "/shop"}>
                                        {hero.primaryButtonText} <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            )}
                            {hero.secondaryButtonText && (
                                <Button
                                    size="lg"
                                    className="h-14 rounded-full border-2 border-white/30 bg-white/10 px-8 text-base font-semibold text-white hover:bg-white/20 hover:border-white/50"
                                    asChild
                                >
                                    <Link href={hero.secondaryButtonLink || "/about"}>
                                        {hero.secondaryButtonText}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="relative h-full min-h-[400px] w-full bg-zinc-800">
                        <div className="h-full w-full">
                            {hero.backgroundImage ? (
                                <Image
                                    src={hero.backgroundImage}
                                    alt="Hero Image"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                            )}
                            {/* Dark Overlay - controlled by CMS */}
                            <div
                                className="absolute inset-0 bg-black"
                                style={{ opacity: hero.overlayOpacity ?? 0.3 }}
                            />
                            {/* Gradient for blending with text side */}
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/50 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
