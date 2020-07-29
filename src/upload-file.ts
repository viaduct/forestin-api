import {Context} from "./context";
import uuid from "uuid";
import {upload as uploadToS3} from "./s3";
import {RawGraphqlUpload, toGraphqlUpload} from "./graphql-upload";

type RawPath = string;
enum PathTokenKind { Index, Array, Name }
interface PathToken
{
    kind: PathTokenKind;
}
interface IndexPathToken extends PathToken
{
    kind: PathTokenKind.Index;
    index: number;
}
interface ArrayPathToken extends PathToken
{
    kind: PathTokenKind.Array;
}
interface NamePathToken extends PathToken
{
    kind: PathTokenKind.Name;
    name: string;
}

function toPathToken(str: string): PathToken | null
{
    if ( str == "#" )
    {
        return {
            kind: PathTokenKind.Array,
        } as ArrayPathToken;
    }
    else if ( /^\d/.test(str) ) // Starts with digit
    {
        return {
            kind: PathTokenKind.Index,
            index: Number(str),
        } as IndexPathToken;
    }
    else // Text token
    {
        return {
            kind: PathTokenKind.Name,
            name: str,
        } as NamePathToken;
    }
}

function toPathTokens(rawPath: RawPath): PathToken[]
{
    const split = rawPath.split("/");

    const pathTokensMayContainNull = split.map(toPathToken);

    const pathTokens = pathTokensMayContainNull.filter(x=>x != null) as PathToken[];
    if ( pathTokensMayContainNull.length == pathTokens.length )
    {
        return pathTokens;
    }
    else
    {
        throw new Error("..");
    }
}

async function permeateChange(c: Context, args: any, pathTokens: PathToken[]): Promise<any>
{
    const [pathToken, ...pathTokenTail] = pathTokens;
    if ( pathToken != null )
    {
        switch ( pathToken.kind )
        {
            case PathTokenKind.Index:
                return await Promise.all(args.map(
                    async (subArgs: any, index: number)=>{
                        if ( index == (pathToken as IndexPathToken).index )
                        {
                            return await permeateChange(c, subArgs, pathTokenTail);
                        }
                        else
                        {
                            return subArgs;
                        }
                    }
                ));
            case PathTokenKind.Array:
                return await Promise.all(args.map(
                    async (subArgs: any)=>{
                        return await permeateChange(c, subArgs, pathTokenTail);
                    }
                ));
            case PathTokenKind.Name:
            {
                const fieldName = (pathToken as NamePathToken).name;
                return {
                    ...args,
                    [fieldName]: permeateChange(c, args[fieldName], pathTokenTail)
                };
            }
            default: throw new Error("..");
        }
    }
    else
    {
        return fileAllocator(c, args);
    }
}

export async function upload(c: Context, args: Promise<any>, rawPaths: RawPath[]): Promise<any>
{
    const tokenedPaths: PathToken[][] = rawPaths.map(toPathTokens);
    async function accum(cur: Promise<any>, tokens: PathToken[]): Promise<any>
    {
        return await permeateChange(c, await cur, tokens);
    }
    return await tokenedPaths.reduce(accum, Promise.resolve(args));
}

type FileUser = [
    number, // subject kind
    string, // subject id
    string, // subject field name
];

// File object format:
interface File
{
    issuedDate: Date;
    _id: string;
    isUploaded: boolean;
    usedFrom: FileUser[];
}

type FileKey = string;

export interface FileAllocator
{
    id: string;
    allocate(user: FileUser): Promise<FileKey>;
}

async function fileAllocator(c: Context, rawGraphqlUpload: RawGraphqlUpload | null): Promise<FileAllocator | null>
{
    if ( rawGraphqlUpload != null )
    {
        // Create file id with uuid and mime.
        const graphqlUpload = toGraphqlUpload(rawGraphqlUpload);
        const newUuid = uuid.v4();
        const mime = graphqlUpload!.mime;
        const id = newUuid + "." + mime;

        // Create file DB object.
        const now = new Date(Date.now());
        const dbObj = {
            _id: id,
            issuedDate: now,
            isUploaded: false,
            usedFrom: [],
        } as File;
        const fileCollectionName = "File";
        await c.mongo.db.collection(fileCollectionName).insertOne(dbObj);

        // Upload it to AWS.
        await uploadToS3({
            key: id,
            s3: c.s3.s3,
            bucketName: c.s3.defaultBucketName,
            mime: graphqlUpload!.mime,
            stream: graphqlUpload!.createReadStream(),
        });

        // Update the DB object as upload finished.
        await c.mongo.db.collection(fileCollectionName).updateOne({_id: id}, {$set: {isUploaded: true}});

        // Then, at last, create the FileAllocator.
        return {
            id: id,
            async allocate(user: FileUser): Promise<FileKey>
            {
                // Add user to the File DB obj.
                await c.mongo.db.collection(fileCollectionName).updateOne({_id: id}, {$addToSet: {usedFrom: user}});

                return id;
            }
        } as FileAllocator;
    }
    else
    {
        return null;
    }
}
