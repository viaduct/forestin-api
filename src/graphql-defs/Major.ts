import {GraphqlKind} from "../lib/Graphql";
import {Context} from "../lib/Context";
import {CollectionKind, prop} from "../lib/db";
import {majors} from "../lib/univ"

export const kind = GraphqlKind.Type;
export const name = "Major";
export const schema = `
    type Major
    {
        id: ID!
        name: String!
        college: College!
    }
`;

export const handlers = [
    // name
    {
        name: "name",
        handler: async (parent: any, args: {}, context: Context)=>{
            return await prop(context.db, CollectionKind.Association, parent.id, "name");
        },
    },
    // college
    {
        name: "college",
        handler: async (parent: any, args: {}, context: Context)=>{
            return await prop(context.db, CollectionKind.Association, parent.id, "parent");
        },
    },
];
