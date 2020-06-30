import {stringToEmailState_object} from "../lib/login";
import {GraphqlKind} from "../lib/Graphql";

export const kind = GraphqlKind.Enum;
export const name = "EmailState";
export const schema = `
    enum EmailState
    {
        NEW 
        USED 
        INVALID
    }
`;

export const enumHandler = stringToEmailState_object;
