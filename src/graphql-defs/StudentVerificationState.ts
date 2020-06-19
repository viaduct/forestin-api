import {studentVerificationStateStringToEnum} from "../lib/db";
import {GraphqlKind} from "../lib/Graphql";

export const kind = GraphqlKind.Enum;
export const name = "StudentVerificationState";
export const schema = `
    enum StudentVerificationState
    {
        PENDING 
        VERIFIED 
        REJECTED
    }
`;

export const enumHandler = studentVerificationStateStringToEnum;
