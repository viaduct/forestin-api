// export enum StudentVerificationState {
//     Pending,
//     Verified,
//     Rejected,
// }
//
// export const studentVerificationStateStringToEnum = {
//     PENDING: StudentVerificationState.Pending,
//     VERIFIED: StudentVerificationState.Verified,
//     REJECTED: StudentVerificationState.Rejected,
// }
//
// export function studentVerificationStateToString(a: StudentVerificationState): string {
//     switch (a) {
//         case StudentVerificationState.Pending:
//             return "PENDING";
//         case StudentVerificationState.Verified:
//             return "VERIFIED";
//         case StudentVerificationState.Rejected:
//             return "REJECTED";
//         default:
//             throw new Error("Something wrong.");
//     }
// }
//
// export function stringToStudentVerificationState(a: string): StudentVerificationState {
//     switch (a) {
//         case "PENDING":
//             return StudentVerificationState.Pending;
//         case "VERIFIED":
//             return StudentVerificationState.Verified;
//         case "REJECTED":
//             return StudentVerificationState.Rejected;
//         default:
//             throw new Error("Something wrong.");
//     }
// }

/*
const enumGenData: EnumGenData = {
    name: "student verification state",
    cols: ["kind", "name"],
    indexableCols: ["kind", "name"],
    value: [
        ["pending", "PENDING"],
        ["verified", "VERIFIED"],
        ["rejected", "REJECTED"],
    ],
};

 */


const jsonData = '{"name":"student verification state","cols":["kind","name"],"indexableCols":["kind","name"],"value":[["pending","PENDING"],["verified","VERIFIED"],["rejected","REJECTED"]]}';
const enumGenData = JSON.parse(jsonData);
const indexedValue = enumGenData.value.map((row: any[], index: number)=>[index, ...row.slice(1)]);

/*
function throwUnindexableCol(col: StudentVerificationStateCol): never
{
    throw new Error("The given column is not indexable: it is " + col);
}
*/

export enum StudentVerificationState
{
    Pending, Verified, Rejected
}

export enum StudentVerificationStateCol
{
    Kind, Name
}

/*
export const indexableCols: Set<StudentVerificationStateCol> = new Set(enumGenData.indexableCols);
*/

function columnIndex(enumValue: StudentVerificationStateCol): number
{
    return enumValue as number; // Or a mapper can be used.
}

export function findFromStudentVerificationState(from: StudentVerificationStateCol, to: StudentVerificationStateCol, value: any): any
{
    /*
    if ( !indexableCols.has(from) )
    {
        throwUnindexableCol(from);
    }
    */

    function rowOf(col: StudentVerificationStateCol, value: any): any
    {
        const colIndex = columnIndex(col);
        return indexedValue.filter((row: any)=>row[colIndex] == value)[0];
    }

    const row = rowOf(from, value);
    return row[columnIndex(to)];

    // const row = enumGenData.value[index(from)];

    // if ( from == 0 ) // Means it is kind-row.
    // {
    //     return row as StudentVerificationStateCol; // Return its index.
    // }
    // else
    // {
    //     return row[index(to)];
    // }
}

export function createDictForStudentVerificationState(from: StudentVerificationStateCol, to: StudentVerificationStateCol): any
{
    return Object.fromEntries(
        indexedValue.map(
            (row: any)=>[row[columnIndex(from)], row[columnIndex(to)]]
        )
    );
}
