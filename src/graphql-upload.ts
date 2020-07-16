export interface GraphqlUpload
{
    name: string;
    mime: string;
    createReadStream: Function;
}

export type RawGraphqlUpload = any;

export function toGraphqlUpload(raw: any | null): GraphqlUpload | null
{
    if ( raw != null )
    {
        return {
            name: raw.filename as string,
            mime: raw.mimetype as string,
            createReadStream: raw.createReadStream,
        };
    }
    else
    {
        return null;
    }
}
