/*
const enumGenData: EnumGenData = {
    name: "user permission kind",
    cols: ["kind", "name"],
    indexableCols: ["kind", "name"],
    value: [
        ["admin", "ADMIN"],
        ["normal", "NORMAL"],
    ],
};

 */

const jsonData = '{"name":"user permission kind","cols":["kind","name"],"indexableCols":["kind","name"],"value":[["admin","ADMIN"],["normal","NORMAL"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: UserPermissionKindCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum UserPermissionKind
{
    Admin, Normal
}

export enum UserPermissionKindCol
{
    Kind, Name
}

/*
export const indexableCols: Set<UserPermissionKindCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: UserPermissionKindCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromUserPermissionKind(from: UserPermissionKindCol, to: UserPermissionKindCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: UserPermissionKindCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as UserPermissionKindCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForUserPermissionKind(from: UserPermissionKindCol, to: UserPermissionKindCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
