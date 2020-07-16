import {v4 as uuid} from "uuid";
import {Context} from "./context";
import {GraphqlUpload} from "./graphql-upload";

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

export async function gqlUpload(
    c: Context,
    uploadObject: GraphqlUpload | null,
): Promise<string | null>
{
    if ( uploadObject != null )
    {
        return (await upload({
            s3: c.s3.s3,
            bucketName: c.s3.defaultBucketName,
            mime: uploadObject.mime,
            stream: uploadObject.createReadStream(),
        })).key;
    }
    else
    {
        return null;
    }
}

export async function gqlDestroy(
    c: Context,
    key: string,
)
{
    await destroy({
        key: key,
        s3: c.s3.s3,
        bucketName: c.s3.defaultBucketName,
    });
}
