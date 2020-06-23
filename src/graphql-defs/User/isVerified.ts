import {Context} from "../../lib/Context";
import {isUserVerifiedForUniversity} from "../../lib/db";

export const name = "isVerified";

interface Params
{
    universityId: string;
}

export async function handler(parent: any, args: Params, context: Context): Promise<boolean>
{
    return await isUserVerifiedForUniversity(context.db, parent.id, args.universityId);

    // // Prepare studentVerification ids.
    // const props = await userProps(context.db, parent.id, {studentVerifications: 1});
    // const studentVerifications: mongo.ObjectId[] = props.studentVerifications;
    //
    // // Prepare studentVerifications.
    // const
    //
    // // Filter that something already verified.
    // const verifiedOnes = studentVerifications=
    //
    // // id => {id: asdf}
    // return studentVerifications.map(oneVerif=>{
    //     return {
    //         id: oneVerif,
    //     };
    // });
}
