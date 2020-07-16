import mongo from "mongodb";
import aws from "aws-sdk";
import {Token} from "./login-token";

export interface Context
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
    Admin, User, Unauthorized
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
    kind: ContextualTokenDataKind.Unauthorized;
}
