import {GraphqlKind} from "../lib/Graphql";
import {Context} from "../lib/Context";
import {CollectionKind, prop} from "../lib/db";
import {campuses} from "../lib/univ"

export const kind = GraphqlKind.Type;
export const name = "University";
export const schema = `
    type University
    {
        id: ID!
        name: String!
        campuses: [Campus!]!
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
    // campuses
    {
        name: "campuses",
        handler: async (parent: any, args: {}, context: Context)=>{
             const children = await campuses(context.db, parent.id);
             return children.map(child=>{
                 return {id: child.associationId};
             });
        }
    },
];
