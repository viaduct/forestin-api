import mongo from "mongodb";

export enum CastKind
{
    Obj, Simple, Emptiable,
}

export enum EmptyKind
{
    NotEmpty, Null, Undefined,
}

export type TransformResult = [
    boolean, // isPassed
    any, // newValue || details
];

export interface Transformer
{
    (a: any): TransformResult
}

export interface MemberCaster
{
    name: string;
    caster: Caster;
}

export interface Caster
{
    kind: CastKind;
}
export interface SimpleCaster extends Caster
{
    kind: CastKind.Simple;
    transformer: Transformer
}
export interface ObjCaster extends Caster
{
    kind: CastKind.Obj;
    memberCasters: MemberCaster[];
}
export interface EmptiableCaster extends Caster
{
    kind: CastKind.Emptiable,
    caster: Caster,
}

export interface MemberCastResult
{
    name: string;
    castResult: CastResult;
}

export interface CastResult
{
    kind: CastKind;
    isPassed: boolean;
}
export interface SimpleCastResult extends CastResult
{
    kind: CastKind.Simple;
    newValue?: any; // When isPassed is true.
    details?: any; // When isPassed is false, and the transformer provides it.
}
export interface ObjCastResult extends CastResult
{
    kind: CastKind.Obj;
    memberResults?: MemberCastResult[]
}
export interface EmptiableCastResult extends CastResult
{
    kind: CastKind.Emptiable;
    isPassed: true;
    emptyKind: EmptyKind;
    castResult?: CastResult;
}

export function emptiableCastWrap(caster: Caster): EmptiableCaster
{
    return {kind: CastKind.Emptiable, caster: caster};
}


export function cast(caster: Caster, value: any): CastResult
{
    switch ( caster.kind )
    {
        case CastKind.Obj:
        {
            // Check whether value is object.
            if ( typeof value != "object" )
            {
                return {
                    kind: CastKind.Obj,
                    isPassed: false,
                } as ObjCastResult;
            }

            const objCaster = caster as ObjCaster;

            // Check for members.
            const memberResults = objCaster.memberCasters.map(
                (mtf: MemberCaster)=>({
                    name: mtf.name,
                    castResult: cast(mtf.caster, value[mtf.name]),
                } as MemberCastResult)
            );

            return {
                kind: CastKind.Obj,
                isPassed: true,
                memberResults: memberResults,
            } as ObjCastResult;
        }
        case CastKind.Simple:
        {
            const simpleCaster = caster as SimpleCaster;

            // Check.
            const [isPassed, newValueOrErrorDetails] = simpleCaster.transformer(value);

            if ( isPassed )
            {
                return {
                    kind: CastKind.Simple,
                    isPassed: true,
                    newValue: newValueOrErrorDetails,
                } as SimpleCastResult;
            }
            else
            {
                return {
                    kind: CastKind.Simple,
                    isPassed: false,
                    details: newValueOrErrorDetails,
                } as SimpleCastResult;
            }
        }
        case CastKind.Emptiable:
        {
            const emptiableCaster = caster as EmptiableCaster;

            // If null or undefined, just return.
            if ( value == null )
            {
                // kind, isPassed, isEmpty, castResult
                return {
                    kind: CastKind.Emptiable,
                    isPassed: true,
                    emptyKind: value === null ? EmptyKind.Null : EmptyKind.Undefined,
                } as EmptiableCastResult;
            }
            else
            {
                return {
                    kind: CastKind.Emptiable,
                    isPassed: true,
                    emptyKind: EmptyKind.NotEmpty,
                    castResult: cast(emptiableCaster.caster, value),
                } as EmptiableCastResult;
            }
        }
        default:
            throw new Error("no.");
    }
}

export function isCastPassed(castResult: CastResult): boolean
{
    const {kind, isPassed: isSuccessful} = castResult;
    if ( isSuccessful )
    {
        switch ( kind )
        {
            case CastKind.Obj:
            {
                const objResult = castResult as ObjCastResult;

                return objResult.memberResults!.filter(
                    memberResult=>isCastPassed(memberResult.castResult)
                ).length == objResult.memberResults!.length;
            }
            case CastKind.Emptiable:
            {
                const emptiableResult = castResult as EmptiableCastResult;

                return emptiableResult.emptyKind != EmptyKind.NotEmpty?
                    true:
                    isCastPassed(emptiableResult.castResult!);
            }
            default:
                return true;
        }
    }
    else
    {
        return false;
    }
}

export function castValue(castResult: CastResult, toObj: boolean = false): any
{
    console.assert(isCastPassed(castResult));

    const {kind} = castResult;
    switch ( kind )
    {
        case CastKind.Obj:
        {
            const objResult = castResult as ObjCastResult;

            const childResults = objResult.memberResults!;
            const objWrap = toObj ? (a: any)=>Object.fromEntries(a) : (a: any)=>a;
            return objWrap(
                childResults.map(
                    childResult=>[childResult.name, castValue(childResult.castResult, toObj)]
                )
            );
        }
        case CastKind.Simple:
            return (castResult as SimpleCastResult).newValue!;
        case CastKind.Emptiable:
        {
            const emptiableResult = castResult as EmptiableCastResult;

            switch ( emptiableResult.emptyKind )
            {
                case EmptyKind.Undefined: return undefined;
                case EmptyKind.Null: return null;
                case EmptyKind.NotEmpty: return castValue(emptiableResult.castResult!, toObj);
                default: throw 0;
            }
        }
        default:
            throw new Error("no.");
    }
}

type CastPath = string;
export interface CastError
{
    path: CastPath;
    details?: any;
}
export interface MemberCastError
{
    name: string;
    castErrors: CastError[];
}

export function listCastErrors(
    castResult: CastResult,
    curPath: CastPath = "",
    result: CastError[] = []
): CastError[]
{
    function pathConcat(a: CastPath, b: CastPath): CastPath
    {
        if ( a.length == 0 )
        {
            return b;
        }
        else if ( a.endsWith("/") )
        {
            return a + b;
        }
        else
        {
            return a + "/" + b;
        }
    }

    const {kind} = castResult;
    switch ( kind )
    {
        case CastKind.Simple:
        {
            // Is it error?
            const {isPassed: isSuccessful} = (castResult as SimpleCastResult);
            if ( !isSuccessful )
            {
                const {details} = (castResult as SimpleCastResult);
                return [...result, {path: curPath, details: details} as CastError];
            }
            else
            {
                return result;
            }
        }
        case CastKind.Obj:
        {
            // Is it error?
            const {isPassed: isSuccessful} = (castResult as ObjCastResult);
            if ( !isSuccessful )
            {
                return [...result, {path: curPath} as CastError];
            }
            else
            {
                // Iterate through all members.
                const memberResults = (castResult as ObjCastResult).memberResults!;

                const castErrorsOfMembers: CastError[][] = memberResults.map(
                    memberResult=>listCastErrors(
                        memberResult.castResult,
                        pathConcat(curPath, memberResult.name),
                    )
                );

                return [...result, ...castErrorsOfMembers.flat()];
            }
        }
        case CastKind.Emptiable:
        {
            const emptiableCastResult = castResult as EmptiableCastResult;

            if ( emptiableCastResult.emptyKind == EmptyKind.NotEmpty )
            {
                return listCastErrors(emptiableCastResult.castResult!, curPath, result);
            }
            else
            {
                return [];
            }
        }
        default:
            throw new Error("no.");
    }
}

export function bundleObjCasters(objCasters: ObjCaster[]): ObjCaster
{
    return objCasters.reduce(
        (cur, stack)=>({
            kind: CastKind.Obj,
            memberCasters: [
                ...cur.memberCasters,
                ...stack.memberCasters,
            ],
        }),
        {
            kind: CastKind.Obj,
            memberCasters: [],
        },
    );
}

export function addMemberCasters(objCaster: ObjCaster, memberCasters: MemberCaster[]): ObjCaster
{
    return {
        kind: CastKind.Obj,
        memberCasters: [
            ...objCaster.memberCasters,
            ...memberCasters,
        ],
    };
}

export type MemberCasterTuple = [
    string, // name
    Caster, // subcaster.
];

export function genObjCaster(mCasters: MemberCasterTuple[]): ObjCaster
{
    return {
        kind: CastKind.Obj,
        memberCasters: mCasters.map(
            (caster: MemberCasterTuple)=>({name: caster[0], caster: caster[1]})
        ),
    };
}

export enum CasterKind
{
    UnsafeBypass,
    Bypass,
    ToMongoId,
    UserName,
    GroupName,
    AssociationId,
    GroupCategoryId,
    Date,
    RawGraphqlUpload,
    Email,
    ToMongoIds,
}

function runTests(tests: Function[]): boolean[]
{
    const testResults = tests.map(
        (test: Function)=>{
            let testResult: boolean;
            try { testResult = test(); }
            catch { return false; }
            return testResult;
        }
    );
    return testResults;
}

const casters = new Map<CasterKind, Caster>([
    [
        CasterKind.UnsafeBypass,
        {
            kind: CastKind.Simple,
            transformer: (a: any)=>[true, a],
        } as SimpleCaster,
    ],
    [
        CasterKind.Bypass,
        {
            kind: CastKind.Simple,
            transformer: (a: any)=>[true, a],
        } as SimpleCaster,
    ],
    [
        CasterKind.ToMongoId,
        {
            kind: CastKind.Simple,
            transformer: (a: any)=>{
                const tests = [
                    ()=>typeof a == "string",
                    ()=>a.length > 0,
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, new mongo.ObjectId(a)]:
                    [false];
            }
        } as SimpleCaster,
    ],
    [
        CasterKind.UserName,
        {
            kind: CastKind.Simple,
            transformer(a: any)
            {
                const tests = [
                    ()=>typeof a == "string",
                    ()=>a.length > 0,
                    ()=>a.length <= 20,
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, a]:
                    [false];
            }
        } as SimpleCaster
    ],
    [
        CasterKind.GroupName,
        {
            kind: CastKind.Simple,
            transformer(a: any)
            {
                const tests = [
                    ()=>typeof a == "string",
                    ()=>a.length > 0,
                    ()=>a.length <= 20,
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, a]:
                    [false];
            }
        } as SimpleCaster
    ],
    [
        CasterKind.AssociationId,
        {
            kind: CastKind.Simple,
            transformer(a: any)
            {
                const tests = [
                    ()=>typeof a == "string",
                    ()=>a.length > 0,
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, a]:
                    [false];
            }
        } as SimpleCaster
    ],
    [
        CasterKind.GroupCategoryId,
        {
            kind: CastKind.Simple,
            transformer(a: any)
            {
                const tests = [
                    ()=>typeof a == "string",
                    ()=>a.length > 0,
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, a]:
                    [false];
            }
        } as SimpleCaster
    ],
    [
        CasterKind.Date,
        {
            kind: CastKind.Simple,
            transformer(a: any)
            {
                const tests = [
                    ()=>a instanceof Date,
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, a]:
                    [false];
            }
        } as SimpleCaster
    ],
    [
        CasterKind.RawGraphqlUpload,
        {
            kind: CastKind.Simple,
            transformer(a: any)
            {
                const tests = [
                    ()=>a != null,
                    ()=>typeof a == "object",
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, a]:
                    [false];
            }
        } as SimpleCaster
    ],
    [
        CasterKind.Email,
        {
            kind: CastKind.Simple,
            transformer(a: any)
            {
                const tests = [
                    ()=>typeof a == "string",
                    ()=>/^[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/.test(a),
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, a]:
                    [false];
            }
        } as SimpleCaster
    ],
    [
        CasterKind.ToMongoIds,
        {
            kind: CastKind.Simple,
            transformer(a: any)
            {
                const tests = [
                    ()=>Array.isArray(a),
                    ()=>a.length == 0 || (a.length != 0 && typeof a[0] == "string"),
                ];
                const tr = runTests(tests);
                return tr.filter(a=>a).length == tests.length?
                    [true, a.map((x: string)=>new mongo.ObjectId(x))]:
                    [false];
            },
        } as SimpleCaster,
    ],
]);

export function caster(casterKind: CasterKind): Caster
{
    const one = casters.get(casterKind);
    if ( one != undefined )
    {
        return one;
    }
    else
    {
        throw new Error("..");
    }
}

// export const rawMongoIdCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         const vldResult = vldRawMongoId(a);
//         if ( vldResult.isPassed )
//         {
//             return [true, a];
//         }
//         else
//         {
//             return [false];
//         }
//     }
// } as SimpleCaster;
//
// export const userNameCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         const vldResult = vldUserName(a);
//         if ( vldResult.isPassed )
//         {
//             return [true, a];
//         }
//         else
//         {
//             return [false];
//         }
//     }
// } as SimpleCaster;
//
// export const groupNameCaster = userNameCaster;
//
// export const booleanCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         return typeof a == "boolean" ? [true, a] : [false];
//     },
// } as SimpleCaster;
//
// export const associationIdCaster = rawMongoIdCaster;
//
// export const groupCategoryCaster = rawMongoIdCaster;
//
// export const stringCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         return typeof a == "string" ? [true, a] : [false];
//     },
// } as SimpleCaster;
//
// export const imageUploadCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         return (
//             typeof a == "object"
//         ) ? [true, a] : [false];
//     },
// } as SimpleCaster;
//
// export const mongoIdCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         if ( a instanceof mongo.ObjectId )
//         {
//             return [true, a];
//         }
//         else if ( typeof a == "string" && a.length != 0 )
//         {
//             return [true, new mongo.ObjectId(a)];
//         }
//         else
//         {
//             return [false];
//         }
//     }
// } as SimpleCaster;
//
// export const dateCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         return a instanceof Date ? [true, a] : [false];
//     },
// } as SimpleCaster;
//
// export const emailCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         const vldResult = vldEmail(a);
//         return vldResult.isPassed ? [true, a] : [false];
//     }
// } as SimpleCaster;
//
// export const uploadCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         return typeof a == "object" ? [true, a] : [false];
//     }
// } as SimpleCaster;
//
// export const categoryIdCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         return typeof a == "number" && Number.isInteger(a) ? [true, a] : [false];
//     }
// } as SimpleCaster;
//
