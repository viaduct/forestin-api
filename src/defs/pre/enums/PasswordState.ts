// export enum PasswordState {
//     Valid, TooShort, NoDigit, NoLatinAlphabet
// }
//
// export function passwordStateToString(a: PasswordState): string {
//     switch (a) {
//         case PasswordState.Valid:
//             return "VALID";
//         case PasswordState.TooShort:
//             return "TOO_SHORT";
//         case PasswordState.NoDigit:
//             return "NO_DIGIT";
//         case PasswordState.NoLatinAlphabet:
//             return "NO_LATIN_ALPHABET";
//         default:
//             console.assert(false, a);
//             return "";
//     }
// }
//
// export const stringToPasswordState_object = {
//     VALID: PasswordState.Valid as number,
//     TOO_SHORT: PasswordState.TooShort as number,
//     NO_DIGIT: PasswordState.NoDigit as number,
//     NO_LATIN_ALPHABET: PasswordState.NoLatinAlphabet as number,
// };

/*
const enumGenData: EnumGenData = {
    name: "password state",
    cols: ["kind", "name"],
    indexableCols: ["kind", "name"],
    value: [
        ["valid", "VALID"],
        ["too short", "TOO_SHORT"],
        ["no digit", "NO_DIGIT"],
        ["no latin alphabet", "NO_LATIN_ALPHABET"],
    ],
};

 */

const jsonData = '{"name":"password state","cols":["kind","name"],"indexableCols":["kind","name"],"value":[["valid","VALID"],["too short","TOO_SHORT"],["no digit","NO_DIGIT"],["no latin alphabet","NO_LATIN_ALPHABET"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: PasswordStateCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum PasswordState
{
    Valid, TooShort, NoDigit, NoLatinAlphabet
}

export enum PasswordStateCol
{
    Kind, Name
}

/*
export const indexableCols: Set<PasswordStateCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: PasswordStateCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromPasswordState(from: PasswordStateCol, to: PasswordStateCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: PasswordStateCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as PasswordStateCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForPasswordState(from: PasswordStateCol, to: PasswordStateCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
