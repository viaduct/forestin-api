import {Context} from "../../lib/Context";
import {userProps} from "../../lib/db";
import mongo from "mongodb";

export const name = "verifiedStudentVerifications";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<any[]>
{
    // TODO

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
