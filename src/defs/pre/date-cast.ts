export function jsDateToString(date: Date): string {
    return date.valueOf().toString();
}

export function stringToJsDate(date: string): Date {
    return new Date(Number(date));
}
