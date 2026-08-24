export function formatToJST(dateString: string | null) {
    if (!dateString) return "期限なし";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    }).format(date);
}

export function formatForDatetimeLocal(isoString?: string | null) {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}