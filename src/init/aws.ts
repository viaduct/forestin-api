import aws from "aws-sdk";
import {assignOrDefault} from "../lib/util";

export interface AwsOptions
{
    s3ApiVersion?: string;
}

export interface Aws
{
    s3: any;
}

export async function init(options: AwsOptions): Promise<Aws>
{
    const s3ApiVersion = assignOrDefault(options.s3ApiVersion, "latest");

    const s3 = new aws.S3({
        apiVersion: s3ApiVersion,
    });

    return {
        s3: s3,
    };
}

