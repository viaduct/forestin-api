import {GraphqlKind} from "../../lib/Graphql";

export const kind = GraphqlKind.Type;
export const name = "Mutation";
export const schema = `
    type Mutation
    {
        signIn(id: String!, password: String!): String!
        refreshSignInToken(token: String!): String!
        signUp(email: String!, password: String!, passFormId: String!): None
        requestStudentVerification(userId: ID, majors: [String!]!, admissionYear: String!, evidences: [Upload!]!): None
    }
`;

import * as signIn from "./signIn";
import * as refreshSignInToken from "./refreshSignInToken";
import * as signUp from "./signUp";

export const handlers = [
    signIn,
    refreshSignInToken,
    signUp,
];

