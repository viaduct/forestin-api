import {stringToPasswordState_object} from "../lib/login";
import {GraphqlKind} from "../lib/Graphql";

export const kind = GraphqlKind.Enum;
export const name = "PasswordState";
export const schema = `
    enum PasswordState
    {
        VALID
        NO_DIGIT
        NO_LATIN_ALPHABET
        TOO_SHORT 
    }
`;

export const enumHandler = stringToPasswordState_object;
