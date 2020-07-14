import {v4 as uuid} from "uuid";
import {Context2} from "./context-2/Context2";
import mongo from "mongodb";
import {CollectionKind} from "./enums/CollectionKind";

export interface UploadOptions
{
    key?: string;
    s3: any;
    bucketName: string;
    mime: string;
    buffer?: any;
    stream?: any;
}

export interface UploadResult
{
    s3Result: any;
    key: string;
}

// TODO: Make a mapping table later.
function mimeToExtension(mime: string): string
{
    switch ( mime )
    {
        case "image/jpeg": return "jpeg";
        case "image/png": return "png";
        default: throw "";
    }
}

export async function upload(options: UploadOptions): Promise<UploadResult>
{
    const {key: givenKey, s3, bucketName, mime, buffer, stream} = options;

    // Generate a general bufferLike object.
    const bufferLike = function(): any
    {
        console.assert(!(buffer && stream)); // Cannot both be valid. One should be null.
        console.assert(!(!buffer && !stream)); // Nor, both be invalid. One should be valid.
        if ( buffer )
        {
            return buffer;
        }
        else //if ( stream )
        {
            return stream.PassThrough();
        }
    }();

    // Generate key.
    const key = function()
    {
        if ( givenKey )
        {
            return givenKey;
        }
        else
        {
            return uuid() + "." + mimeToExtension(mime);
        }
    }();

    // Upload to s3.
    const s3Args = {
        Bucket: bucketName,
        Key: key,
        Body: bufferLike,
        ContentType: mime,
    };
    const result = await s3.putObject(s3Args).promise();

    return {
        s3Result: result,
        key: key,
    };
}

export interface DestroyOptions
{
    key: string;
    s3: any;
    bucketName: string;
}

export interface DestroyResult
{
    s3Result: any;
}

export async function destroy(options: DestroyOptions): Promise<DestroyResult>
{
    const {key, s3, bucketName} = options;

    // Delete the object.
    const s3Args = {
        Key: key,
        Bucket: bucketName,
    };
    const result = await s3.deleteObject(s3Args).promise();

    return {
        s3Result: result,
    };
}

export enum FileUserKind
{
    UserAvatar,
    StudentVerificationEvidence,
}

export interface FileUsedBy
{
    kind: FileUserKind;
}

export interface FileUsedByUserAvatar extends FileUsedBy
{
    kind: FileUserKind.UserAvatar;
    userId: mongo.ObjectId;
}

export interface FileUsedByStudentVerification extends FileUsedBy
{
    kind: FileUserKind.StudentVerificationEvidence;
    studentVerificationId: mongo.ObjectId;
}

export async function uploadFile(
    c: Context2,
    mime: string,
    usedBy: FileUsedBy,
    isStream: boolean,
    streamOrBuffer: any
): Promise<[string]>
{
    // Upload to s3.
    const {key} = await upload({
        s3: c.s3.s3,
        bucketName: c.s3.defaultBucketName,
        mime: mime,
        ...(isStream ? {stream: streamOrBuffer} : {buffer: streamOrBuffer}),
    });

    // Upload to db.
    const obj = {
        _id: key,
        mime: mime,
        usedBy: usedBy,
    };
    const {insertedId} = await c.mongo.collec(CollectionKind.File).insertOne(obj);

    // Return id.
    return [insertedId.toString()];
}

export async function destroyFile(
    c: Context2,
    key: string
)
{
    // Remove from db.
    await c.mongo.collec(CollectionKind.File).deleteOne({_id: key});

    // Remove from s3.
    await destroy({
        key: key,
        s3: c.s3.s3,
        bucketName: c.s3.defaultBucketName,
    });
}
