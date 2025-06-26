export const INT32_MAX = 2147483647; // Shift left to get 2^31, then subtract 1

export class TimeFormatter {
    /**
     * Formats a given time in seconds into a human-readable string.
     * @param seconds Number of seconds to format.
     * @returns A formatted string (e.g., "2d 3h", "1h 5m", "30s").
     */
    static formatUnixTime(seconds: number): string {
        if (seconds < 0 || seconds >= INT32_MAX) {
            return "N/A";
        }

        if (seconds == 0) {
            return "0s";
        }

        const days = Math.floor(seconds / (24 * 3600));
        seconds %= 24 * 3600;
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        // Build result string with no more than 2 components
        if (days > 0) {
            if (hours > 0) return `${days}d ${hours}h`;
            return `${days}d`;
        }

        if (hours > 0) {
            if (minutes > 0) return `${hours}h ${minutes}m`;
            return `${hours}h`;
        }

        if (minutes > 0) {
            if (secs > 0) return `${minutes}m ${secs}s`;
            return `${minutes}m`;
        }

        return `${secs}s`;
    }
}
