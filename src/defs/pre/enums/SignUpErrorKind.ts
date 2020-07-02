/*
const enumGenData: EnumGenData = {
    name: "sign up error kind",
    cols: ["kind", "name"],
    indexableCols: ["kind", "name"],
    value: [
        ["insufficient password", "INSUFFICIENT_PASSWORD"],
        ["insufficient email", "INSUFFICIENT_EMAIL"],
        ["insufficient pass form", "INSUFFICIENT_PASS_FORM"],
        ["unknown error", "UNKNOWN_ERROR"],
    ],
};

 */

const jsonData = '{"name":"sign up error kind","cols":["kind","name"],"indexableCols":["kind","name"],"value":[["insufficient password","INSUFFICIENT_PASSWORD"],["insufficient email","INSUFFICIENT_EMAIL"],["insufficient pass form","INSUFFICIENT_PASS_FORM"],["unknown error","UNKNOWN_ERROR"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: SignUpErrorKindCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum SignUpErrorKind
{
    InsufficientPassword, InsufficientEmail, InsufficientPassForm, UnknownError
}

export enum SignUpErrorKindCol
{
    Kind, Name
}

/*
export const indexableCols: Set<SignUpErrorKindCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: SignUpErrorKindCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromSignUpErrorKind(from: SignUpErrorKindCol, to: SignUpErrorKindCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: SignUpErrorKindCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as SignUpErrorKindCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForSignUpErrorKind(from: SignUpErrorKindCol, to: SignUpErrorKindCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
