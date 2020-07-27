import {cast, Caster, CastResult, castValue, isCastPassed} from "./type-cast";
import {Context} from "./context";
import {AuthQuery, authQueryFac, AuthQueryKind} from "./auth";
import {upload as uploadFiles} from "./upload-file";
import {ChatHostKind} from "./enums/ChatHostKind";
import mongo from "mongodb";

export type ExternReqHandler = (c: Context, args: any)=>Promise<any>

export function externReqHandler({
    caster,
    castErrorHandler,
    authPolicy,
    authErrorHandler,
    uploadPaths,
    businessLogic,
    }: {
    caster: Caster;
    castErrorHandler: (c: Context, args: any, cr: CastResult)=>void | Promise<void>;
    authPolicy: AuthQuery;
    authErrorHandler: (c: Context, args: any)=>void | Promise<void>;
    uploadPaths: string[];
    businessLogic: {(c: Context, args: any): any | Promise<any>};
}): ExternReqHandler
{
    return async function(c: Context, args: any): Promise<any>
    {
        // Check casting result.
        const castResult = await cast(caster, args);
        // If there's any cast error, throw.
        if ( !isCastPassed(castResult) )
        {
            await Promise.resolve(castErrorHandler(c, args, castResult));
            return;
        }
        const validValue = castValue(castResult, true);

        // Check auth.
        const isAuthPassed = await authPolicy.test(c, validValue);
        if ( !isAuthPassed )
        {
            await Promise.resolve(authErrorHandler(c, validValue));
            return
        }

        // Upload.
        const fileAllocatorInsertedValue = await uploadFiles(c, validValue, uploadPaths);

        // Call business logic.
        const result = await Promise.resolve(businessLogic(c, args));
        return result;
    };
}

export type GraphqlHandler = (parent: any, args: any, c: Context)=>any | Promise<any>;

export function gqlWrap(handler: ExternReqHandler): GraphqlHandler
{
    return function (parent: any, args: any, c: Context): any | Promise<any>
    {
        return handler(c, args);
    }
}

export interface ChatHost
{
    kind: ChatHostKind;
}
export interface ChatHostGroup
{
    kind: ChatHostKind.Group;
    group: mongo.ObjectId;
}
export interface ChatHostGroupQna
{
    kind: ChatHostKind.GroupQna;
    group: mongo.ObjectId;
    user: mongo.ObjectId;
}

export enum ChatMsgKind
{
    Text, File,
}

export interface ChatMsg
{
    kind: ChatMsgKind;
}
export interface TextChatMsg
{
    kind: ChatMsgKind.Text;
    body: string;
}
export interface FileChatMsg
{
    kind: ChatMsgKind.Text;
    body: string; // This is a key, not a simple text.
}

export function removeAsSet(list: any[], they: any[]): any[]
{
    const listSet = new Set(list);
    they.map(it=>listSet.delete(it));
    return Array.from(listSet);
}

export function addAsSet(list: any[], they: any[]): any[]
{
    const listSet = new Set(list);
    they.map(it=>listSet.add(it));
    return Array.from(listSet);
}

export type VoteChoiceId = string;

export interface VoteDecision
{
    voter: mongo.ObjectId;
    choices: VoteChoiceId[];
}

export function throwInvalid()
{
    throw {kind: "INVALID"};
}

export function throwUnauth()
{
    throw {kind: "UNAUTHORIZED"};
}
