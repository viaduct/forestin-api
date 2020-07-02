import {GraphqlDef, mergeGraphqlDefs} from "../pre/graphql-aggregate";
import mongo from "mongodb";
import {FindName} from "../../init/collection-name-map";
import {GraphQLUpload} from "graphql-upload";
import {GraphQLScalarType} from "graphql";
import {user} from "./user-schema";
import {mutation} from "./mutation-schema";
import {query} from "./query-schema";
import {studentVerification} from "./student-verification-schema";
import {association} from "./association-schema";
import {graphqlEnum} from "./enum-schema";
import {jsDateToString, stringToJsDate} from "../pre/date-cast";
import {CollectionKind} from "../pre/enums/CollectionKind";

const rootDefs: GraphqlDef[] = [
    {
        typeDefs: "enum None { NONE }",
        resolvers: {},
    },
    {
        typeDefs: "",
        resolvers: {
            Upload: GraphQLUpload
        },
    },
    {
        typeDefs: "scalar StaticDate",
        resolvers: {
            StaticDate: new GraphQLScalarType({
                name: "StaticDate",
                description: "Non-timezone considering, date-precision time-representing type. Initially introduced to represent birthday, but its usage may be expended more in the future.",
                serialize: a=>a,
                parseValue: a=>a,
            }),
        },
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
    [mergeGraphqlDefs(rootDefs), user, mutation, query, studentVerification, association, graphqlEnum],
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


