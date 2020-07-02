/*
const enumGenData: EnumGenData = {
    name: "collection kind",
    cols: ["kind"],
    indexableCols: ["kind"],
    value: [
        ["user"],
        ["student verification"],
        ["association"],
    ],
};

 */

/*
function throwUnindexableCol(col: CollectionKindCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

/*
export const indexableCols: Set<CollectionKindCol> = new Set(enumGenData.indexableCols);
*/


const jsonData = '{"name":"collection kind","cols":["kind"],"indexableCols":["kind"],"value":[["user"],["student verification"],["association"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number) => [index, ...row.slice(1)]);

export enum CollectionKind {
    User, StudentVerification, Association
}

export enum CollectionKindCol {
    Kind
}

function columnIndex(enumValue: CollectionKindCol): number {
    return enumValue as number; // Or a mapper can be used.
}

export function findFromCollectionKind(from: CollectionKindCol, to: CollectionKindCol, value: any): any {
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: CollectionKindCol, value: any): any {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any) => row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as CollectionKindCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForCollectionKind(from: CollectionKindCol, to: CollectionKindCol): any {
    return Object.fromEntries(
        indexedValue.map(
            (row: any) => [row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
