const jsonData = '{"name":"group post state","cols":["kind","name"],"indexableCols":["kind","name"],"value":[["private","PRIVATE"],["pending public approval","PENDING_PUBLIC_APPROVAL"],["public","PUBLIC"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: GroupPostStateCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum GroupPostState
{
    Private, PendingPublicApproval, Public
}

export enum GroupPostStateCol
{
    Kind, Name
}

/*
export const indexableCols: Set<GroupPostStateCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: GroupPostStateCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromGroupPostState(from: GroupPostStateCol, to: GroupPostStateCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: GroupPostStateCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as GroupPostStateCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForGroupPostState(from: GroupPostStateCol, to: GroupPostStateCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
