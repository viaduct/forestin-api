/*
const enumGenData: EnumGenData = {
    name: "association level kind",
    cols: ["kind", "name", "level"],
    indexableCols: ["kind", "name", "level"],
    value: [
        ["university", "UNIVERSITY", 1],
        ["campus", "CAMPUS", 2],
        ["college", "COLLEGE", 3],
        ["major", "MAJOR", 4],
    ],
};

 */

const jsonData = '{"name":"association level kind","cols":["kind","name","level"],"indexableCols":["kind","name","level"],"value":[["university","UNIVERSITY",1],["campus","CAMPUS",2],["college","COLLEGE",3],["major","MAJOR",4]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: AssociationLevelKindCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum AssociationLevelKind
{
    University, Campus, College, Major
}

export enum AssociationLevelKindCol
{
    Kind, Name, Level
}

/*
export const indexableCols: Set<AssociationLevelKindCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: AssociationLevelKindCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromAssociationLevelKind(from: AssociationLevelKindCol, to: AssociationLevelKindCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: AssociationLevelKindCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as AssociationLevelKindCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForAssociationLevelKind(from: AssociationLevelKindCol, to: AssociationLevelKindCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
