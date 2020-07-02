import {DayPrecDate} from "../simple-types";

export function jsDateToString(date: Date): DayPrecDate {
    return date.valueOf().toString();
}

export function stringToJsDate(date: DayPrecDate): Date {
    return new Date(Number(date));
}
