import {GraphqlKind} from "../../lib/Graphql";

export const kind = GraphqlKind.Type;
export const name = "Query";
export const schema = `
    type Query
    {
        signUpEmailCheck(email: String!): EmailState!
        signUpPasswordCheck(password: String!): PasswordState!
    }
`;

import * as signUpEmailCheck from "./signUpEmailCheck";
import * as signUpPasswordCheck from "./signUpPasswordCheck";

export const handlers = [
    signUpEmailCheck,
    signUpPasswordCheck,
];
