import {Context} from "../../lib/Context";
import {requestStudentVerification} from "../../lib/login";
import mongo from "mongodb";


export const name = "requestStudentVerification";

interface Params
{
    userId: string;
    majors: [string];
    admissionYear: string;
    evidences: [any];/* raw Graphql upload */
}

export async function handler(parent: any, args: Params, context: Context)
{
    await requestStudentVerification(
        context.db,
        context.s3,
        new mongo.ObjectId(args.userId),
        args.majors,
        args.admissionYear,
        args.evidences,
    );
}
