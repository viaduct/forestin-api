import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {Context} from "../pre/Context";
import {CollectionKind} from "../pre/enums/CollectionKind";
import {fromOldContext} from "../pre/context-2/Context2";

const fileDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type File
            {
                id: ID!
                mime: String!
            }
        `,
        resolvers: {
            File: {
                mime: async (parent: any, _: any, c: Context)=>{
                    const c2 = await fromOldContext(c);

                    return (await c2.mongo.collec(CollectionKind.File).findOne(
                        {_id: parent.id},
                        {
                            _id: 0,
                            mime: 1,
                        },
                    )).mime;
                }
            },
        },
    },
];

export const file: GraphqlDef = mergeGraphqlDefs(fileDefs);

