import {Context} from "../pre/Context";
import mongo from "mongodb";
import {dbObjProp} from "./graphql-schema";
import {GraphqlDef, mergeGraphqlDefs} from "../pre/graphql-aggregate";
import {CollectionKind} from "../pre/enums/CollectionKind";

const associationDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type University
            {
                id: ID!
                name: String!
                campuses: [Campus!]!
            }
        `,
        resolvers: {
            University: {
                name: dbAssociationNameForGraphql,
                campuses: dbAssociationChildrenForGraphql,
            },
        },
    },
    {
        typeDefs: `
            type Major
            {
                id: ID!
                name: String!
                college: College!
            }
        `,
        resolvers: {
            Major: {
                name: dbAssociationNameForGraphql,
                college: dbAssociationParentForGraphql,
            }
        },
    },
    {
        typeDefs: `
            type Campus 
            {
                id: ID!
                name: String!
                colleges: [College!]!
                university: University!
            }
        `,
        resolvers: {
            Campus: {
                name: dbAssociationNameForGraphql,
                colleges: dbAssociationChildrenForGraphql,
                university: dbAssociationParentForGraphql,
            },
        },
    },
    {
        typeDefs: `
            type College
            {
                id: ID!
                name: String!
                majors: [Major!]!
                campus: Campus!
            }
        `,
        resolvers: {
            College: {
                name: dbAssociationNameForGraphql,
                campus: dbAssociationParentForGraphql,
                majors: dbAssociationChildrenForGraphql,
            },
        },
    },
];

export const association: GraphqlDef = mergeGraphqlDefs(associationDefs);

async function dbObjPropWithContext(
    context: Context,
    collectionKind: CollectionKind,
    id: mongo.ObjectId,
    propName: string,
): Promise<any>
{
    return await dbObjProp(
        context.db,
        collectionKind,
        context.collectionNameMap,
        id,
        propName,
    );
}

async function dbAssociationNameForGraphql(
    parent: {id: string},
    _: any,
    context: Context
): Promise<any>
{
    const {db, collectionNameMap: findName} = context;

    const obj = await db
        .collection(findName(CollectionKind.Association))
        .findOne({associationId: parent.id}, {name: 1} as any) as any;

    return obj.name;
}

async function dbAssociationChildrenForGraphql(
    parent: {id: string},
    _: any,
    context: Context
): Promise<any>
{
    const {db, collectionNameMap: findName} = context;

    const children = await db
        .collection(findName(CollectionKind.Association))
        .find({parent: parent.id})
        .project({associationId: 1})
        .toArray();

    return children.map(child=>child.associationId);
}

async function dbAssociationParentForGraphql(
    parent: {id: string},
    _: any,
    context: Context
): Promise<any>
{
    const parentAssoc = await dbObjPropWithContext(
        context,
        CollectionKind.Association,
        new mongo.ObjectId(parent.id),
        "parent",
    );

    return parentAssoc;
}
