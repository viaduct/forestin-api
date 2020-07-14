import {Context2, ContextualTokenData, ContextualTokenDataKind, UserContextualTokenData} from "../context-2/Context2";
import mongo from "mongodb";
import {CollectionKind} from "../enums/CollectionKind";

export enum AuthKind
{
    Admin, UserIn, MemberIn, Unknown, And, Or
}

export async function handleAuth(c: Context2, policy: any[], contextualTokenData: ContextualTokenData): Promise<boolean>
{
    const kind = policy[0];
    switch ( kind )
    {
        case AuthKind.Admin:
        {
            const allowAdmin = policy[1];
            return allowAdmin && contextualTokenData.kind == ContextualTokenDataKind.Admin
        }
        case AuthKind.UserIn:
        {
            const userIds = policy[1];
            return (userIds as Array<mongo.ObjectId>).includes((contextualTokenData as UserContextualTokenData).userId);
        }
        case AuthKind.MemberIn:
        {
            // Get all members of all groups.
            const groupId = policy[1];

            const allMemberIds = (
                await c.mongo.collec(CollectionKind.GroupMember)
                    .find({group: groupId})
                    .project({_id: 0, user: 1})
                    .toArray()
            ).map((userObj: any)=>userObj.user);

            const userIdInToken = (contextualTokenData as UserContextualTokenData).userId;
            return allMemberIds.includes(userIdInToken);
        }
        case AuthKind.Unknown:
        {
            const allowUnknown: boolean = policy[1];
            return allowUnknown && contextualTokenData.kind == ContextualTokenDataKind.Unknown;
        }
        case AuthKind.And:
        {
            const children = policy[1];

            const results = await Promise.all(
                children.map((child: any)=>handleAuth(c, child, contextualTokenData))
            );

            return results.filter((a: any)=>a).length == results.length;
        }
        case AuthKind.Or:
        {
            const children = policy[1];

            const results = await Promise.all(
                children.map((child: any)=>handleAuth(c, child, contextualTokenData))
            );

            return results.filter((a: any)=>a).length > 0;
        }
        default:
            throw new Error("no.");
    }
}

export enum CastKind
{
    Obj, Simple
}

type TransformResult = [
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
        // const [childResults] = castResult.slice(2);
        // return objWrap(
        //     childResults.map(
        //         (r: any)=>[r[0], r[2]]
        //     )
        // );
        case CastKind.Simple:
            return (castResult as SimpleCastResult).newValue!;
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

function listCastErrors(
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

// const nameCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         const checks = [
//             ()=>typeof a == "string",
//             ()=>a.length > 0,
//             ()=>a.length <= 20,
//         ];
//         const checkResults = checks.filter(check=>check());
//
//         if ( checkResults.length == checks.length )
//         {
//             return [true, a];
//         }
//         else
//         {
//             return [false];
//         }
//     },
// };
//
// const ageCaster = {
//     kind: CastKind.Simple,
//     transformer: (a: any)=>{
//         const checks = [
//             ()=>typeof a == "number",
//             ()=>Number.isInteger(a),
//         ];
//         const checkResults = checks.filter(check=>check());
//
//         if ( checkResults.length == checks.length )
//         {
//             return [true, a];
//         }
//         else
//         {
//             return [false];
//         }
//     },
// };
//
// const userCaster = {
//     kind: CastKind.Obj,
//     memberCasters: [
//         {
//             name: "name",
//             caster: nameCaster,
//         },
//         {
//             name: "age",
//             caster: ageCaster,
//         },
//     ],
// } as ObjCaster;
//
// const userWithFriendCaster = addMemberCasters(
//     userCaster,
//     [
//         {
//             name: "friend",
//             caster: userCaster,
//         },
//     ],
// );
//
// const myObj = {
//     name: "asf",
//     age: 32,
//     friend: {
//         name: "Johnson",
//         age: 22.2
//     }
// };
//
// const castResult = cast(userWithFriendCaster, myObj);
// const isValid = isCastPassed(castResult);
// // const value = castValue(castResult, true);
// const errs = listCastErrors(castResult);
//
// const printThese = [
//     myObj,
//     castResult,
//     isValid,
//     // value,
//     errs
// ];
// printThese.forEach(i=>console.log(i));
