import {Context} from "../../context";
import {signUp as biSignUp} from "../../bl";

export async function signUp(_: any, args: any, c: Context)
{
    // Call business logic.
    const newUserId = await biSignUp(c,  args);

    return {id: newUserId.toString()};
}

