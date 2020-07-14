import mongo from "mongodb";
import aws from "aws-sdk";
import {Token} from "../simple-types";
import {Context} from "../Context";
import {CollectionKind, collectionKindActualNames} from "../enums/CollectionKind";

export async function fromOldContext(oldC: Context): Promise<Context2>
{
    return {
        mongo: {
            db: oldC.db,
            collec: (kind: CollectionKind)=>{
                const colName = collectionKindActualNames[kind as number];
                return oldC.db.collection(colName);
            },
        },
        s3: {
            s3: oldC.s3,
            defaultBucketName: oldC.defaultS3BucketName,
        },
        auth: {
            privateKey: oldC.privateKey,
            tokenLifetime: oldC.tokenLifetime,
        },
        token: {
            token: "", // todo
        },
        contextualTokenData: {
            tokenData: {kind: ContextualTokenDataKind.Admin},
        },
    };
}

export interface Context2
{
    mongo: MongoContext;
    s3: S3Context;
    auth: AuthContext;
    token: TokenContext;
    contextualTokenData: ContextualTokenDataContext;
}

export interface MongoContext
{
    db: mongo.Db;
    collec: Function; // collecKind -> mongo.Collection
}

export interface S3Context
{
    s3: aws.S3;
    defaultBucketName: string;
}

export interface AuthContext
{
    privateKey: string;
    tokenLifetime: number;
}

export interface TokenContext
{
    token: Token;
}

export interface ContextualTokenDataContext
{
    tokenData: ContextualTokenData;
}

export enum ContextualTokenDataKind
{
    Admin, User, Unknown
}

export interface ContextualTokenData
{
    kind: ContextualTokenDataKind;
}

export interface AdminContextualTokenData extends ContextualTokenData
{
    kind: ContextualTokenDataKind.Admin;
}

export interface UserContextualTokenData extends ContextualTokenData
{
    kind: ContextualTokenDataKind.User;
    userId: mongo.ObjectId;
}

export interface UnknownContextualTokenData extends ContextualTokenData
{
    kind: ContextualTokenDataKind.Unknown;
}
