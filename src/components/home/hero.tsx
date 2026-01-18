import { getCMSContent, HeroContent, HeroVariant } from "@/lib/actions/cms-actions";
import { HeroSplit, HeroCentered, HeroMinimal, HeroFullscreen } from "./hero-variants";

// Default hero content (used when CMS is not set up)
const defaultHero: HeroContent = {
    variant: "split",
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

// Map variant names to components
const heroVariants = {
    split: HeroSplit,
    centered: HeroCentered,
    minimal: HeroMinimal,
    fullscreen: HeroFullscreen,
    premium: HeroSplit,
};

export async function Hero() {
    // Fetch CMS content, fall back to defaults
    const cmsHero = await getCMSContent<HeroContent>("hero");
    const hero = { ...defaultHero, ...cmsHero };

    // Get the variant component, default to "split"
    const variant = (hero.variant || "split") as HeroVariant;
    const HeroComponent = heroVariants[variant] || HeroSplit;

    return <HeroComponent hero={hero} />;
}
