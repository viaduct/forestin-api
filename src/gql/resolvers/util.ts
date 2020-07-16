import {Context} from "../../context";
import {gqlUpload} from "../../s3";
import {toGraphqlUpload} from "../../graphql-upload";

export function bypassId(_: any, args: any): any
{
    return {id: args.id};
}

export function emptyWrap(a: any, nullToUndef = true): any {
    const entries = Object.entries(a);
    const result = entries
        .filter(entry => entry !== undefined)
        .map(
            (entry: any) => {
                if (entry === null) {
                    return nullToUndef ? undefined : null;
                } else if (typeof entry == "object") {
                    return emptyWrap(entry, nullToUndef);
                } else {
                    return entry;
                }
            }
        );
    return Object.fromEntries(result);
}

export type UnsettableItem = [
    string, // normal name
    string, // unset name
    boolean, // isFile
]

export async function convUnset(c: Context, a: any, uItems: UnsettableItem[]): Promise<any> {
    return Object.fromEntries(
        await Promise.all(
            uItems.map(async ([name, unsetName, isFile]: UnsettableItem) => {
                let value: string | null | undefined;
                if (a[unsetName]) {
                    value = null;
                } else {
                    if (a[name] != null) {
                        if (isFile) {
                            value = await gqlUpload(c, toGraphqlUpload(a))
                        } else {
                            value = a[name];
                        }
                    } else {
                        value = undefined;
                    }
                }
                return [name, value];
            })
        )
    );
}
