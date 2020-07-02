const jsonData = '{"name":"group member kind","cols":["kind","name"],"indexableCols":["kind","name"],"value":[["owner","OWNER"],["manager","MANAGER"],["normal","NORMAL"],["applicant","APPLICANT"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: GroupMemberKindCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum GroupMemberKind
{
    Owner, Manager, Normal, Applicant
}

export enum GroupMemberKindCol
{
    Kind, Name
}

/*
export const indexableCols: Set<GroupMemberKindCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: GroupMemberKindCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromGroupMemberKind(from: GroupMemberKindCol, to: GroupMemberKindCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: GroupMemberKindCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as GroupMemberKindCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForGroupMemberKind(from: GroupMemberKindCol, to: GroupMemberKindCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
