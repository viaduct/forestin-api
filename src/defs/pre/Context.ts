import {TokenData} from "./login";
import mongo from "mongodb";
import aws from "aws-sdk";
import {FindName} from "../../init/collection-name-map";

export interface Context
{
    db: mongo.Db; // Mongo DB
    s3: aws.S3; // AWS S3
    user?: TokenData;
    collectionNameMap: FindName;
    defaultS3BucketName: string;
    privateKey: string;
    tokenLifetime: number;
}
