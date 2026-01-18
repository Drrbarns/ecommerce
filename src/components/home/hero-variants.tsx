import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroContent } from "@/lib/actions/cms-actions";

interface HeroVariantProps {
    hero: HeroContent;
}

/**
 * Split Hero - Current design with text on left, image on right
 */
export function HeroSplit({ hero }: HeroVariantProps) {
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
                            <div
                                className="absolute inset-0 bg-black"
                                style={{ opacity: hero.overlayOpacity ?? 0.3 }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/50 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/**
 * Centered Hero - Text centered with full-width background
 */
export function HeroCentered({ hero }: HeroVariantProps) {
    return (
        <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                {hero.backgroundImage ? (
                    <Image
                        src={hero.backgroundImage}
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div
                        className="h-full w-full"
                        style={{ backgroundColor: hero.backgroundColor || '#0B1220' }}
                    />
                )}
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: hero.overlayOpacity ?? 0.5 }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 py-20 max-w-4xl mx-auto">
                {hero.badge && (
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-xl mb-6">
                        <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        {hero.badge}
                    </span>
                )}

                <h1
                    className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
                    style={{ color: hero.textColor || '#FFFFFF' }}
                >
                    {hero.title}
                </h1>

                <p
                    className="mt-6 text-lg md:text-xl max-w-2xl mx-auto"
                    style={{ color: hero.subtitleColor || '#d4d4d8' }}
                >
                    {hero.subtitle}
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    {hero.primaryButtonText && (
                        <Button
                            size="lg"
                            className="h-14 rounded-full bg-white text-black px-8 text-base font-semibold hover:bg-white/90"
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
                            variant="outline"
                            className="h-14 rounded-full border-2 border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
                            asChild
                        >
                            <Link href={hero.secondaryButtonLink || "/about"}>
                                {hero.secondaryButtonText}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}

/**
 * Minimal Hero - Clean, simple design with subtle animations
 */
export function HeroMinimal({ hero }: HeroVariantProps) {
    // Smart color inversion: If text is white (likely from dark theme), force it to dark for this light-themed variant
    const isWhite = (color?: string) => !color || color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';

    const titleColor = isWhite(hero.textColor) ? '#18181B' : hero.textColor; // Default to Zinc-950 if white
    const subtitleColor = (!hero.subtitleColor || hero.subtitleColor === '#a1a1aa') ? '#52525B' : hero.subtitleColor; // Default to Zinc-600 if gray-400

    return (
        <section
            className="w-full min-h-[75vh] flex items-center relative overflow-hidden"
            style={{ backgroundColor: hero.backgroundColor || '#FFFFFF' }}
        >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

            <div className="max-w-[1440px] mx-auto px-6 py-20 md:py-32 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                {/* Text Content */}
                <div className="flex flex-col items-start text-left order-2 lg:order-1">
                    {hero.badge && (
                        <span
                            className="inline-block text-xs font-bold tracking-widest uppercase mb-6 px-3 py-1 bg-zinc-100 text-zinc-900 rounded-sm"
                        >
                            {hero.badge}
                        </span>
                    )}

                    <h1
                        className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                        style={{ color: titleColor }}
                    >
                        {hero.title}
                    </h1>

                    <p
                        className="mt-8 text-lg leading-relaxed max-w-lg"
                        style={{ color: subtitleColor }}
                    >
                        {hero.subtitle}
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">
                        {hero.primaryButtonText && (
                            <Button
                                size="lg"
                                className="h-14 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
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
                                variant="outline"
                                className="h-14 rounded-full px-8 text-base font-semibold border-2 hover:bg-zinc-50"
                                style={{ borderColor: isWhite(hero.textColor) ? '#e4e4e7' : 'currentColor', color: titleColor }}
                                asChild
                            >
                                <Link href={hero.secondaryButtonLink || "/about"}>
                                    {hero.secondaryButtonText}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Image */}
                <div className="relative order-1 lg:order-2">
                    <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                        {hero.backgroundImage ? (
                            <Image
                                src={hero.backgroundImage}
                                alt="Hero Image"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                                priority
                            />
                        ) : (
                            <div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                                No Image Selected
                            </div>
                        )}
                        {/* Inner shadow for depth */}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem]" />
                    </div>

                    {/* Floating elements effect */}
                    <div className="absolute -bottom-6 -left-6 -z-10 w-full h-full border-2 border-primary/20 rounded-[2rem]" />
                </div>
            </div>
        </section>
    );
}

/**
 * Fullscreen Hero - Dramatic full-viewport design
 */
export function HeroFullscreen({ hero }: HeroVariantProps) {
    return (
        <section className="relative w-full h-screen flex items-end overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                {hero.backgroundImage ? (
                    <Image
                        src={hero.backgroundImage}
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div
                        className="h-full w-full"
                        style={{ backgroundColor: hero.backgroundColor || '#0B1220' }}
                    />
                )}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,${hero.overlayOpacity ?? 0.3}) 50%, rgba(0,0,0,0.1) 100%)`
                    }}
                />
            </div>

            {/* Content at bottom */}
            <div className="relative z-10 w-full px-6 pb-20 md:pb-32">
                <div className="max-w-7xl mx-auto">
                    {hero.badge && (
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-xl mb-6">
                            {hero.badge}
                        </span>
                    )}

                    <h1
                        className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none max-w-4xl"
                        style={{ color: hero.textColor || '#FFFFFF' }}
                    >
                        {hero.title}
                    </h1>

                    <div className="mt-8 flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
                        <p
                            className="text-lg md:text-xl max-w-md"
                            style={{ color: hero.subtitleColor || '#a1a1aa' }}
                        >
                            {hero.subtitle}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {hero.primaryButtonText && (
                                <Button
                                    size="lg"
                                    className="h-14 rounded-full bg-white text-black px-8 text-base font-semibold hover:bg-white/90"
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
                                    variant="outline"
                                    className="h-14 rounded-full border-2 border-white/40 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
                                    asChild
                                >
                                    <Link href={hero.secondaryButtonLink || "/about"}>
                                        {hero.secondaryButtonText}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
