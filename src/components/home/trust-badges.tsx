"use client";

import { Truck, ShieldCheck, RotateCcw, HeadphonesIcon } from "lucide-react";
import { motion } from "framer-motion";

interface TrustBadge {
    icon: "truck" | "shield" | "return" | "support";
    title: string;
    description: string;
}

interface TrustBadgesProps {
    badges?: TrustBadge[];
    backgroundColor?: string;
}

const defaultBadges: TrustBadge[] = [
    {
        icon: "truck",
        title: "Free Shipping",
        description: "On orders over ₵500"
    },
    {
        icon: "shield",
        title: "Secure Payment",
        description: "100% protected"
    },
    {
        icon: "return",
        title: "Easy Returns",
        description: "30-day policy"
    },
    {
        icon: "support",
        title: "24/7 Support",
        description: "Dedicated help"
    }
];

const iconMap = {
    truck: Truck,
    shield: ShieldCheck,
    return: RotateCcw,
    support: HeadphonesIcon
};

export function TrustBadges({
    badges = defaultBadges,
    backgroundColor = "#FAFAFA"
}: TrustBadgesProps) {
    return (
        <section
            className="py-8 md:py-12 border-y"
            style={{ backgroundColor }}
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {badges.map((badge, index) => {
                        const Icon = iconMap[badge.icon];
                        return (
                            <motion.div
                                key={badge.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col md:flex-row items-center md:items-start gap-3 text-center md:text-left"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm md:text-base">
                                        {badge.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {badge.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
