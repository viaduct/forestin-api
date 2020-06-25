import {GraphqlKind} from "../lib/Graphql";
import {Context} from "../lib/Context";
import {CollectionKind, prop} from "../lib/db";
import {majors} from "../lib/univ"

export const kind = GraphqlKind.Type;
export const name = "College";
export const schema = `
    type College
    {
        id: ID!
        name: String!
        majors: [Major!]!
        campus: Campus!
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
        name: "majors",
        handler: async (parent: any, args: {}, context: Context)=>{
            const children = await majors(context.db, parent.id);
            return children.map(child=>{
                return {id: child.associationId};
            });
        }
    },
    // university
    {
        name: "campus",
        handler: async (parent: any, args: {}, context: Context)=>{
            return await prop(context.db, CollectionKind.Association, parent.id, "parent");
        },
    },
];
