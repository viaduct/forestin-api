import {Context} from "../../../context";
import {
    applyGroup,
    createGroup,
    createStudentVerification,
    findUserByEmailPassword,
    fixStudentVerification, leaveGroup,
    signUp as biSignUp, succeedGroupOwner, updateGroup, updateMember,
    updateUser
} from "../../../bl";
import {createTokenFromEmailPassword, refreshToken} from "../../../login-token";
import mongo from "mongodb";
import {throwNimpl} from "../../../errors";
import {RawGraphqlUpload, toGraphqlUpload} from "../../../graphql-upload";
import {gqlUpload} from "../../../s3";

export const resolver = {
    signUp: async (_: any, args: any, c: Context)=>{
        // Call business logic.
        const newUserId = await biSignUp(c,  args);
        return {id: newUserId.toString()};
    },
    signIn: async (_: any, args: any, c: Context)=>{
        const token = await createTokenFromEmailPassword(c, args.email, args.password);
        const userId = await findUserByEmailPassword(c, args.email, args.password);
        return {
            token: token,
            userId: userId,
        };
    },
    refreshToken: (_: any, args: any, c: Context)=> {
        return refreshToken(c, args.oldToken);
    },
    updateUser: (_: any, args: any, c: Context)=>{
        updateUser(
            c,
            new mongo.ObjectId(args.userId),
            {...args, userId: undefined}
        );
    },
    destroyUser: (_: any, args: any, c: Context)=>{
        throwNimpl();
    },
    requestStudentVerification: async (_: any, args: any, c: Context)=>{
        const newArgs = {
            ...args,

            // rename, and to mongo id.
            userId: undefined,
            user: new mongo.ObjectId(args.userId),

            // Upload.
            evidences: await Promise.all(args.evidences.map(
                async (evidence: RawGraphqlUpload)=>{
                    const gqlUploadObj = toGraphqlUpload(evidence);
                    const key = await gqlUpload(c, gqlUploadObj);
                    return key;
                }
            )),

            majors: args.majors.map(
                (majorStrId: string)=>(new mongo.ObjectId(majorStrId))
            ),
        };
        const newSvId = await createStudentVerification(c, newArgs);
        return {id: newSvId.toString()};
    },
    confirmStudentVerification: async (_: any, args: any, c: Context)=>{
        await fixStudentVerification(c, new mongo.ObjectId(args.studentVerificationId), true);
    },
    rejectStudentVerification: async (_: any, args: any, c: Context)=>{
        await fixStudentVerification(c, new mongo.ObjectId(args.studentVerificationId), false);
    },
    findPassword: (_: any, args: any, c: Context)=> {
        throwNimpl();
    },

    createGroup: async (_: any, args: any, c: Context)=>{
        const mappedArgs = {
            ...args,

            // uploads
            poster: await gqlUpload(c, toGraphqlUpload(args.poster)),
            backgroud: await gqlUpload(c, toGraphqlUpload(args.background)),
        };
        const newGroupId = await createGroup(c, args);
        return {id: newGroupId};
    },
    updateGroup: async (_: any, args: any, c: Context)=>{
        const mappedArgs = emptyWrap({
            ...args,

            groupId: undefined,

            // helpers.
            unsetPoster: undefined,
            poster: undefined,
            unsetBackground: undefined,
            background: undefined,

            // uploads
            ...await convUnset(
                c,
                args,
                [
                    ["poster", "unsetPoster", true],
                    ["background", "unsetBackground", true],
                    ["applicationState", "unsetApplicationState", false],
                ],
            ),
        });

        await updateGroup(c, new mongo.ObjectId(args.groupId), args);
    },
    destroyGroup: ()=>throwNimpl(),
    applyGroup: async (_: any, args: any, c: Context)=>{
        await applyGroup(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.userId),
        );
    },
    leaveGroup: async (_: any, args: any, c: Context)=>{
        await leaveGroup(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.userId),
        );
    },
    kickFromGroup: async (_: any, args: any, c: Context)=>{
        await leaveGroup(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.userId),
        );
    },
    updateMember: async (_: any, args: any, c: Context)=>{
        await updateMember(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.userId),
            args.newMemberKind,
        );
    },
    succeedGroupOwner: async (_: any, args: any, c: Context)=>{
        await succeedGroupOwner(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.newOwnerId),
        );
    },
};

export function emptyWrap(a: any, nullToUndef = true): any
{
    const entries = Object.entries(a);
    const result = entries
        .filter(entry=>entry!==undefined)
        .map(
            (entry: any)=>{
                if ( entry === null )
                {
                    return nullToUndef ? undefined : null;
                }
                else if ( typeof entry == "object" )
                {
                    return emptyWrap(entry, nullToUndef);
                }
                else
                {
                    return entry;
                }
            }
        );
    return Object.fromEntries(result);
}

export type UnsettableItem = [
    string, // normal name
    string, // unset name
    boolean, // isFile
]

export async function convUnset(c: Context, a: any, uItems: UnsettableItem[]): Promise<any>
{
    return Object.fromEntries(
        await Promise.all(
            uItems.map(async ([name, unsetName, isFile]: UnsettableItem)=>{
                let value: string | null | undefined;
                if ( a[unsetName] )
                {
                    value = null;
                }
                else
                {
                    if ( a[name] != null )
                    {
                        if ( isFile )
                        {
                            value = await gqlUpload(c, toGraphqlUpload(a))
                        }
                        else
                        {
                            value = a[name];
                        }
                    }
                    else
                    {
                        value = undefined;
                    }
                }
                return [name, value];
            })
        )
    );
}
