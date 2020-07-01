// export enum EmailState {
//     New, Used, Invalid
// }
//
// export function emailStateToString(a: EmailState): string {
//     switch (a) {
//         case EmailState.New:
//             return "NEW";
//         case EmailState.Used:
//             return "USED";
//         case EmailState.Invalid:
//             return "INVALID";
//         default:
//             console.assert(false, a);
//             return "";
//     }
// }
//
// export const stringToEmailState_object = {
//     NEW: EmailState.New as number,
//     USED: EmailState.Used as number,
//     INVALID: EmailState.Invalid as number,
// };

const jsonData = '{"name":"email state","cols":["kind","name"],"indexableCols":["kind","name"],"value":[["new","NEW"],["used","USED"],["invalid","INVALID"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: EmailStateCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum EmailState
{
    New, Used, Invalid
}

export enum EmailStateCol
{
    Kind, Name
}

/*
export const indexableCols: Set<EmailStateCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: EmailStateCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromEmailState(from: EmailStateCol, to: EmailStateCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: EmailStateCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as EmailStateCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForEmailState(from: EmailStateCol, to: EmailStateCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
