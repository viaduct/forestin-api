import {TokenData} from "./login";

export interface Context
{
    db: any; // Mongo DB
    s3: any; // AWS S3
    user?: TokenData;
}
