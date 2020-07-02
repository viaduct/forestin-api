/*
const enumGenData: EnumGenData = {
    name: "gender",
    cols: ["kind", "name"],
    indexableCols: ["kind", "name"],
    value: [
        ["male", "MALE"],
        ["female", "FEMALE"],
        ["others", "OTHERS"],
    ],
};

 */

const jsonData = '{"name":"gender","cols":["kind","name"],"indexableCols":["kind","name"],"value":[["male","MALE"],["female","FEMALE"],["others","OTHERS"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: GenderCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum Gender
{
    Male, Female, Others
}

export enum GenderCol
{
    Kind, Name
}

/*
export const indexableCols: Set<GenderCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: GenderCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromGender(from: GenderCol, to: GenderCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: GenderCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as GenderCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForGender(from: GenderCol, to: GenderCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
