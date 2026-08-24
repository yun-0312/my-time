const COLOR_MAP: Record<string, string> = {
    mint: "#5FCFA0",
    sunshine: "#FFB84D",
    lavender: "#B79CED",
    peach: "#FFCCCC",
    babyblue: "#7ce9e9",
};

export function getHexColor(colorName?: string | null): string {
    if (!colorName) return "#E2E8F0";
    if (colorName.startsWith("#") || colorName.startsWith("var(")) return colorName;
    return COLOR_MAP[colorName.toLowerCase()] || "#E2E8F0";
}