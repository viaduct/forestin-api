import {GraphqlKind} from "../lib/Graphql";
import {Context} from "../lib/Context";
import {CollectionKind, prop} from "../lib/db";
import {colleges} from "../lib/univ"

export const kind = GraphqlKind.Type;
export const name = "Campus";
export const schema = `
    type Campus 
    {
        id: ID!
        name: String!
        colleges: [College!]!
        university: University!
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
        name: "colleges",
        handler: async (parent: any, args: {}, context: Context)=>{
            const children = await colleges(context.db, parent.id);
            return children.map(child=>{
                return {id: child.associationId};
            });
        }
    },
    // university
    {
        name: "university",
        handler: async (parent: any, args: {}, context: Context)=>{
            return await prop(context.db, CollectionKind.Association, parent.id, "parent");
        },
    },
];
