import {Gender, genderNames} from "../enums/Gender";

export interface VldResult
{
    tests: Function[];
    passedCount: number;
    isPassed: boolean;
}
export function runValidation(tests: Function[]): VldResult
{
    function validateUntilFails(tests: Function[], passedTestsCount: number = 0): number
    {
        if ( tests.length != 0 )
        {
            const [testHead, ...testTail] = tests;

            if ( testHead() == true )
            {
                return validateUntilFails(
                    testTail,
                    passedTestsCount + 1,
                );
            }
            else
            {
                return passedTestsCount;
            }
        }
        else
        {
            return passedTestsCount;
        }
    }

    const passedTestsCount = validateUntilFails(tests);
    const isSuccessful = passedTestsCount == tests.length;
    return {
        tests: tests,
        passedCount: passedTestsCount,
        isPassed: isSuccessful,
    };
}

export enum PasswordVldResult
{
    Valid,
    TooShort,
    TooLong,
    NoDigit,
    NoLatinAlphabet,
    InvalidType,
}

export const passwordVldResultNames = [
    "VALID",
    "TOO_SHORT",
    "TOO_LONG",
    "NO_DIGIT",
    "NO_LATIN_ALPHABET",
    "INVALID_TYPE"
]

export const passwordVldResultByPassedCount = [
    PasswordVldResult.InvalidType,
    PasswordVldResult.TooShort,
    PasswordVldResult.TooLong,
    PasswordVldResult.NoDigit,
    PasswordVldResult.NoLatinAlphabet,
    PasswordVldResult.Valid,
];

export function vldPassword(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "string",
        ()=>a.length >= 4,
        ()=>a.length <= 128,
        ()=>/[0-9]+/.test(a), // Has any digit
        ()=>/[a-zA-Z]+/.test(a), // Has any latin alphabet
    ]);
}

export function vldEmail(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "string",
        ()=>/^[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/.test(a),
    ]);
}

export function vldObject(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "object",
    ]);
}

export function vldToken(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "string",
        ()=>a.length > 0,
    ]);
}

export function vldPassFormId(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "string",
        ()=>a.length > 0,
    ]);
}

function vldName(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "string",
        ()=>a.length > 0,
        ()=>a.length <= 20,
    ]);
}

export const vldUserName = vldName;

export function vldDayPrecDate(a: any): VldResult
{
    const regex = /^[0-9]{4}-([0-9]{2})-([0-9]{2})$/;
    const month = (str: string)=>Number(regex.exec(str)![1]);
    const day = (str: string)=>Number(regex.exec(str)![2]);

    return runValidation([
        ()=>typeof a == "string",
        ()=>regex.test(a),
        ()=>month(a) > 0,
        ()=>month(a) <= 12,
        ()=>day(a) > 0,
        ()=>{
            switch ( month(a) )
            {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    return day(a) <= 31;
                case 2:
                    return day(a) <= 29;
                case 4:
                case 6:
                case 9:
                case 11:
                    return day(a) <= 30;
                default:
                    return false;
            }
        },
    ]);
}

export function castGender(a: any): [VldResult, Gender | null]
{
    const find = ()=>{
        const index = genderNames.indexOf(a) as Gender;
        return index != -1 ? index : null;
    }
    const vld = runValidation([
        ()=>typeof a == "string",
        ()=>find() != null,
    ]);

    return [vld, find()];
}

export function vldPhoneNumber(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "string",
        ()=>a.length > 0,
        ()=>a.length <=20,
        ()=>/^[0-9]+$/.test(a), // Only contains digit.
    ]);
}

export function vldRawMongoId(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "string",
        ()=>a.length > 0,
    ]);
}

export function vldYear(a: any): VldResult
{
    return runValidation([
        ()=>typeof a == "string",
        ()=>/\d{4}/.test(a),
    ]);
}
