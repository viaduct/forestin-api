import {GraphqlDef, mergeGraphqlDefs} from "../pre/new-graphql";
import mongo from "mongodb";
import {FindName} from "../../init/collection-name-map";
import {GraphQLUpload} from "graphql-upload";
import {Context} from "../pre/Context";
import {CollectionKind} from "../pre/defines";
import {jsDateToString, stringToJsDate, studentVerificationStateStringToEnum} from "../db";
import {GraphQLScalarType} from "graphql";
import {user} from "./userSchema";
import {mutation} from "./mutationSchema";
import {query} from "./querySchema";
import {studentVerification} from "./studentVerificationSchema";

const rootDefs: GraphqlDef[] = [
    {
        typeDefs: "enum None { NONE }",
        resolvers: {},
    },
    {
        typeDefs: "scalar GraphQLUpload",
        resolvers: {GraphQLUpload},
    },
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
    graphqlEnumDef(
        "student verification state",
        [
            "pending",
            "verified",
            "rejected",
        ],
        studentVerificationStateStringToEnum, // TODO
    ),
    graphqlEnumDef(
        "password state",
        [
            "valid",
            "no digit",
            "no latin alphabet",
            "too short",
        ],
        null, // TODO
    ),
    graphqlEnumDef(
        "email state",
        ["new", "used", "invalid"],
        null, // TODO
    ),
    {
        typeDefs: "scalar StaticDate",
        resolvers: new GraphQLScalarType({
            name: "StaticDate",
            description: "Non-timezone considering, date-precision time-representing type. Initially introduced to represent birthday, but its usage may be expended more in the future.",
            serialize: a=>a,
            parseValue: a=>a,
        }),
    },
    {
        typeDefs: `
            scalar TimeStamp
        `,
        resolvers: {
            TimeStamp: new GraphQLScalarType({
                name: "TimeStamp",
                description: "Millisecond-precision timestamp. Can be used to initialize via new Date(timestamp).",
                serialize: (value: Date): string=>{
                    return jsDateToString(value);
                },
                parseValue: (value: string): Date=>{
                    return stringToJsDate(value);
                },
            }),
        },
    },
];

export const root: GraphqlDef = mergeGraphqlDefs(
    [...rootDefs, user, mutation, query, studentVerification],
);

function noIdProject(project: any)
{
    if ( "_id" in project )
    {
        return project;
    }
    else
    {
        return {
            ...project,
            _id: 0,
        };
    }
}

async function dbObjProps(
    db: mongo.Db,
    collectionKind: CollectionKind,
    findName: FindName,
    id: mongo.ObjectId,
    project: any,
): Promise<any>
{
    const queryResult = await db.collection(findName(collectionKind)).findOne({_id: id}, noIdProject(project));

    return queryResult;
}

export async function dbObjProp(
    db: mongo.Db,
    collectionKind: CollectionKind,
    findName: FindName,
    id: mongo.ObjectId,
    propName: string,
): Promise<any>
{
    const props = await dbObjProps(
        db, collectionKind, findName, id, {[propName]: 1},
    );

    return props[propName];
}

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
        .findOne({associationId: parent.id}, {name: 1});

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

function toPascal(
    name: string,
    isCapital: boolean = true,
    result: string = ""
): string
{
    if ( name.length != 0 )
    {
        const cur = name[0];

        if ( cur == " " )
        {
            return toPascal(name.slice(1), true, result)
        }
        else // cur is just a lower-case letter.
        {
            const target = isCapital ? cur.toUpperCase() : cur;
            return toPascal(name.slice(1), false, result + target);
        }
    }
    else
    {
        return result;
    }
}

function toUpperPascal(
    name: string,
    result: string = "",
): string
{
    if ( name.length != 0 )
    {
        const cur = name[0];

        if ( cur == " " )
        {
            return toUpperPascal(name.slice(1), result + "_");
        }
        else
        {
            return toUpperPascal(name.slice(1), result + cur.toUpperCase());
        }
    }
    else
    {
        return result;
    }
}

function graphqlEnumDef(
    name: string,
    items: string[],
    resolver: any,
): GraphqlDef
{
    return {
        typeDefs: `enum ${toPascal(name)} { ${items.map(item=>toUpperPascal(item)).join(", ")} }`,
        resolvers: {
            [toPascal(name)]: resolver,
        }
    }
}
