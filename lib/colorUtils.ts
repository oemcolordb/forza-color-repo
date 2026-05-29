/**
 * @fileoverview Utility functions for handling and normalizing color data.
 */

/**
 * Normalizes an RGB color string (e.g., "255, 0, 128") into an object.
 * @param rgbString The raw comma-separated RGB string.
 * @returns { {r: number, g: number, b: number} } The RGB components.
 * @throws {Error} If the string format is invalid.
 */
export function parseRgbString(rgbString: string): { r: number, g: number, b: number } {
    const parts = rgbString.split(',');
    if (parts.length !== 3) {
        throw new Error(`Invalid RGB string format: Expected 3 comma-separated values, got ${parts.length - 1}.`);
    }

    const r = parseInt(parts[0].trim());
    const g = parseInt(parts[1].trim());
    const b = parseInt(parts[2].trim());

    if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || g < 0 || b < 0) {
        throw new Error("RGB components must be non-negative integers.");
    }

    return { r, g, b };
}

/**
 * Converts an RGB object to a standard Hex color string (e.g., "#AABBCC").
 * @param colorObj The object containing {r, g, b} values (0-255).
 * @returns {string} The Hex color code.
 * @throws {Error} If the color object is missing required properties.
 */
export function rgbToHex(colorObj: { r: number, g: number, b: number }): string {
    const { r, g, b } = colorObj;

    const toHex = (c: number): string => {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    const hexR = toHex(r);
    const hexG = toHex(g);
    const hexB = toHex(b);

    return `#${hexR}${hexG}${hexB}`.toUpperCase();
}

/**
 * Converts a Hex color string (e.g., "#AABBCC") to an RGB object.
 * @param hexColor The color string starting with '#'.
 * @returns { {r: number, g: number, b: number} } The RGB components.
 * @throws {Error} If the hex string is invalid.
 */
export function hexToRgb(hexColor: string): { r: number, g: number, b: number } {
    if (!hexColor.startsWith('#') || hexColor.length !== 7) {
        throw new Error("Invalid hex color format. Must be #RRGGBB.");
    }

    const hex = hexColor.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}