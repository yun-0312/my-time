export function parseLocalDateTimeToUTC(value: string | null | undefined): string | null {
    if (!value) return null;

    const jstString = value.includes("+") || value.endsWith("Z") ? value : `${value}:00+09:00`;

    const date = new Date(jstString);

    return isNaN(date.getTime()) ? null : date.toISOString();
}

//日本時間の「今日」の始まり（00:00:00）と終わり（23:59:59）のUTC文字列を取得する
export function getTodayJSTRange() {
    const todayJstString = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date()).replace(/\//g, "-");

    const startOfTodayUTC = new Date(`${todayJstString}T00:00:00+09:00`).toISOString();
    const endOfTodayUTC = new Date(`${todayJstString}T23:59:59+09:00`).toISOString();

    return {
        todayJstString,
        startOfTodayUTC,
        endOfTodayUTC,
    };
}

// 今日の 09:00 の "YYYY-MM-DDTHH:mm" 形式の文字列を作るヘルパー
export function getTodayDefaultDatetime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // 朝9時に設定する場合
    return `${year}-${month}-${day}T09:00`;
}
