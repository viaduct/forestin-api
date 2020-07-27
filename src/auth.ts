import {Context, ContextualTokenDataKind, UserContextualTokenData} from "./context";
import mongo from "mongodb";

export interface AuthQuery
{
    kind: AuthQueryKind;
    test(c: Context, args: any): Promise<boolean>;
}

export type AuthQueryFac = Function;

export enum AuthQueryKind
{
    And,
    Or,
    IsAdmin,
    IsUser,
    IsChatRoomMember,
    IsGroupMember,
    IsGroupManageable,
    IsGroupOwner,
    IsTheUser,
    IsVoteMember,
    IsBillMember,
    OnlyContainsTheUser,
}

const authQueryFacs = new Map<AuthQueryKind, AuthQueryFac>([
    [
        AuthQueryKind.And,
        function(tests: AuthQuery[]): AuthQuery
        {
            return {
                kind: AuthQueryKind.And,
                tests: tests,
                async test(c: Context, args: any): Promise<boolean>
                {
                    const everyTestResult = await Promise.all(tests.map(
                        (test: AuthQuery)=>test.test(c, args)
                    ));
                    const passedTestResults = everyTestResult.filter(
                        (oneResult: boolean)=>oneResult
                    );
                    return passedTestResults.length == tests.length;
                }
            } as AuthQuery;
        }
    ],
    [
        AuthQueryKind.Or,
        function(tests: AuthQuery[]): AuthQuery
        {
            return {
                kind: AuthQueryKind.Or,
                tests: tests,
                async test(c: Context, args: any): Promise<boolean>
                {
                    const everyTestResult = await Promise.all(tests.map(
                        (test: AuthQuery)=>test.test(c, args)
                    ));
                    const passedTestResults = everyTestResult.filter(
                        (oneResult: boolean)=>oneResult
                    );
                    return passedTestResults.length != 0;
                }
            } as AuthQuery;
        }
    ],
    [
        AuthQueryKind.IsAdmin,
        function(): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsAdmin,
                async test(c: Context, args: any): Promise<boolean> {
                    return c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.Admin;
                },
            } as AuthQuery;
        }
    ],
    [
        AuthQueryKind.IsUser,
        function(): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsUser,
                async test(c: Context, args: any): Promise<boolean> {
                    return c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User;
                },
            } as AuthQuery;
        }
    ],
    [
        AuthQueryKind.IsChatRoomMember,
        function(chatRoomIdGetter: (c: Context, args: any)=>mongo.ObjectId): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsChatRoomMember,
                async test(c: Context, args: any): Promise<boolean> {
                    if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
                    {
                        const userId = (c.contextualTokenData.tokenData as UserContextualTokenData).userId;
                        // todo: Query the db, check whether userId is the chatroom member.
                        return true; // todo remove this.
                    }
                    else
                    {
                        return false;
                    }
                },
            } as AuthQuery;
        }
    ],
    [
        AuthQueryKind.IsGroupMember,
        function(groupIdGetter: (c: Context, args: any)=>mongo.ObjectId): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsGroupMember,
                async test(c: Context, args: any): Promise<boolean> {
                    if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
                    {
                        const userId = (c.contextualTokenData.tokenData as UserContextualTokenData).userId;
                        // todo: Query the db, check whether userId is the group member.
                        return true; // todo remove this.
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    ],
    [
        AuthQueryKind.IsGroupManageable,
        function(groupIdGetter: (c: Context, args: any)=>mongo.ObjectId): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsGroupManageable,
                async test(c: Context, args: any): Promise<boolean>
                {
                    if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
                    {
                        const userId = (c.contextualTokenData.tokenData as UserContextualTokenData).userId;
                        // todo: Query the db, check whether userId is the group manager or owner.
                        return true; // todo remove this.
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    ],
    [
        AuthQueryKind.IsGroupOwner,
        function(groupIdGetter: (c: Context, args: any)=>mongo.ObjectId): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsGroupOwner,
                async test(c: Context, args: any): Promise<boolean>
                {
                    if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
                    {
                        const userId = (c.contextualTokenData.tokenData as UserContextualTokenData).userId;
                        // todo: Query the db, check whether userId is the group owner.
                        return true; // todo remove this.
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    ],
    [
        AuthQueryKind.IsTheUser,
        function(theUserIdGetter: (c: Context, args: any)=>mongo.ObjectId): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsTheUser,
                async test(c: Context, args: any): Promise<boolean>
                {
                    if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
                    {
                        const userId = (c.contextualTokenData.tokenData as UserContextualTokenData).userId;
                        return userId.equals(theUserIdGetter(c, args));
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    ],
    [
        AuthQueryKind.IsVoteMember,
        function(voteIdGetter: (c: Context, args: any)=>mongo.ObjectId): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsVoteMember,
                async test(c: Context, args: any): Promise<boolean>
                {
                    if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
                    {
                        const userId = (c.contextualTokenData.tokenData as UserContextualTokenData).userId;
                        // todo: Query the db, check whether userId belongs to the vote.
                        return true; // todo remove this.
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    ],
    [
        AuthQueryKind.IsBillMember,
        function(billIdGetter: (c: Context, args: any)=>mongo.ObjectId): AuthQuery
        {
            return {
                kind: AuthQueryKind.IsBillMember,
                async test(c: Context, args: any): Promise<boolean>
                {
                    if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
                    {
                        const userId = (c.contextualTokenData.tokenData as UserContextualTokenData).userId;
                        // todo: Query the db, check whether userId belongs to the bill.
                        return true; // todo remove this.
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    ],
    [
        AuthQueryKind.OnlyContainsTheUser,
        function(userIdsGetter: (c: Context, args: any)=>mongo.ObjectId[]): AuthQuery
        {
            return {
                kind: AuthQueryKind.OnlyContainsTheUser,
                async test(c: Context, args: any): Promise<boolean>
                {
                    if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
                    {
                        const userId = (c.contextualTokenData.tokenData as UserContextualTokenData).userId.toString();
                        const userIdsSet = new Set(userIdsGetter(c, args).map(id=>id.toString()));
                        return userIdsSet.has(userId);
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    ],
]);

class NoAuthQueryFac
{
    constructor(
        public givenKind: AuthQueryKind
    ){}
}

export function authQueryFac(kind: AuthQueryKind): AuthQueryFac
{
    if ( authQueryFacs.has(kind) )
    {
        return authQueryFacs.get(kind)!;
    }
    else
    {
        throw new NoAuthQueryFac(kind);
    }
}

export function authArgGet(name: string): Function
{
    return (c: Context, args: any)=>args[name]
}

export function authUserSubjectId(): Function
{
    return (c: Context, args: any)=>{
        if ( c.contextualTokenData.tokenData.kind == ContextualTokenDataKind.User )
        {
            return (c.contextualTokenData.tokenData as UserContextualTokenData).userId;
        }
        else
        {
            return new mongo.ObjectId();
        }
    }
}
