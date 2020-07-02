export function valueInRange<T>(from: T, to: T, value: T): boolean
{
    return value >= from && value <= to;
}
