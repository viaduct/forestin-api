export function toPascal(
    name: string,
    isCapital: boolean = true,
    result: string = ""
): string {
    if (name.length != 0) {
        const cur = name[0];

        if (cur == " ") {
            return toPascal(name.slice(1), true, result)
        } else // cur is just a lower-case letter.
        {
            const target = isCapital ? cur.toUpperCase() : cur;
            return toPascal(name.slice(1), false, result + target);
        }
    } else {
        return result;
    }
}

export function toUpperSnake(
    name: string,
    result: string = "",
): string {
    if (name.length != 0) {
        const cur = name[0];

        if (cur == " ") {
            return toUpperSnake(name.slice(1), result + "_");
        } else {
            return toUpperSnake(name.slice(1), result + cur.toUpperCase());
        }
    } else {
        return result;
    }
}
