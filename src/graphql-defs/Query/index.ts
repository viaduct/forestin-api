import {GraphqlKind} from "../../lib/Graphql";

export const kind = GraphqlKind.Type;
export const name = "Query";
export const schema = `
    type Query
    {
        signUpEmailCheck(email: String!): EmailState!
        signUpPasswordCheck(password: String!): PasswordState!
        user(userId: ID): User!
    }
`;

import * as signUpEmailCheck from "./signUpEmailCheck";
import * as signUpPasswordCheck from "./signUpPasswordCheck";
import * as user from "./user";

export const handlers = [
    signUpEmailCheck,
    signUpPasswordCheck,
    user,
];
