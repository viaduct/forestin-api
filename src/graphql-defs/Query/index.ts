import {GraphqlKind} from "../../lib/Graphql";

export const kind = GraphqlKind.Type;
export const name = "Query";
export const schema = `
    type Query
    {
        fuck: Boolean
    }
`;

import * as fuckHandler from "./fuck";
export const handlers = [
    fuckHandler,
];
