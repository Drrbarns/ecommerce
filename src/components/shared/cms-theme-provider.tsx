import { getActiveTheme, CMSTheme } from "@/lib/actions/cms-actions";

// This component fetches theme colors from CMS and injects them as CSS variables
// It only affects the storefront, not the admin dashboard

interface ThemeProviderProps {
    children: React.ReactNode;
}

export async function CMSThemeProvider({ children }: ThemeProviderProps) {
    const theme = await getActiveTheme();

    // Generate CSS custom properties from theme
    const getCSSVariables = (t: CMSTheme | null) => {
        if (!t) return {};

        // Convert hex colors to HSL for Tailwind compatibility
        const hexToHSL = (hex: string): string => {
            // Remove # if present
            hex = hex.replace('#', '');

            // Parse hex values
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            let s = 0;
            const l = (max + min) / 2;

            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch (max) {
                    case r:
                        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                        break;
                    case g:
                        h = ((b - r) / d + 2) / 6;
                        break;
                    case b:
                        h = ((r - g) / d + 4) / 6;
                        break;
                }
            }

            // Return HSL values compatible with Tailwind CSS
            return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
        };

        return {
            '--primary': hexToHSL(t.primary_color),
            '--primary-foreground': hexToHSL(t.primary_foreground),
            '--secondary': hexToHSL(t.secondary_color),
            '--secondary-foreground': hexToHSL(t.secondary_foreground),
            '--accent': hexToHSL(t.accent_color),
            '--accent-foreground': hexToHSL(t.accent_foreground),
            '--background': hexToHSL(t.background_color),
            '--foreground': hexToHSL(t.foreground_color),
            '--card': hexToHSL(t.card_color),
            '--card-foreground': hexToHSL(t.card_foreground),
            '--muted': hexToHSL(t.muted_color),
            '--muted-foreground': hexToHSL(t.muted_foreground),
            '--border': hexToHSL(t.border_color),
            '--ring': hexToHSL(t.ring_color),
            '--destructive': hexToHSL(t.destructive_color),
            '--destructive-foreground': hexToHSL(t.destructive_foreground),
        };
    };

    const cssVars = getCSSVariables(theme);
    const style = Object.entries(cssVars)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');

    return (
        <div style={cssVars as React.CSSProperties}>
            {children}
        </div>
    );
}
