import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {createDbObjPropForGraphql, dbObjProp} from "../pre/actions/db";
import {CollectionKind} from "../pre/enums/CollectionKind";
import {Context} from "../pre/Context";
import mongo from "mongodb";
import {GroupApplicationState} from "../pre/db-schemas/Group";
import {isGroupApplicable} from "../pre/actions/group";

const groupGqlHnd = (name: string, caster?: Function)=>
    createDbObjPropForGraphql(CollectionKind.Group, name, caster);

const defs: GraphqlDef[] = [
    {
        typeDefs: `
            type Group
            {
                id: ID!
                name: String!
                description: String!
                isSchool: Boolean!
                association: String!
                
                poster: String!
                background: String!
                
                isApplicable: Boolean!
                applicableFrom: TimeStamp
                applicableTo: TimeStamp
                requiredAssociation: String
            }
        `,
        resolvers: {
            name: groupGqlHnd("name"),
            description: groupGqlHnd("description"),
            isSchool: groupGqlHnd("isSchool"),
            association: groupGqlHnd("association"),
            poster: groupGqlHnd("poster"),
            background: groupGqlHnd("background"),
            isApplicable: async (parent: {id: string}, _: any, context: Context)=>{
                return await isGroupApplicable(context, new mongo.ObjectId(parent.id), Date.now());
            },
            applicableFrom: async (parent: {id: string}, _: any, context: Context)=> {
                const applicationState: Partial<GroupApplicationState> = await dbObjProp(
                    context,
                    CollectionKind.Group,
                    new mongo.ObjectId(parent.id),
                    "applicationState",
                );

                if (applicationState != null) {
                    return applicationState.applicableFrom;
                } else {
                    return null;
                }
            },
            applicableTo: async (parent: {id: string}, _: any, context: Context)=>{
                const applicationState: Partial<GroupApplicationState> = await dbObjProp(
                    context,
                    CollectionKind.Group,
                    new mongo.ObjectId(parent.id),
                    "applicationState",
                );

                if (applicationState != null) {
                    return applicationState.applicableTo;
                } else {
                    return null;
                }
            },
            requiredAssociation: async (parent: {id: string}, _: any, context: Context)=>{
                const applicationState: Partial<GroupApplicationState> = await dbObjProp(
                    context,
                    CollectionKind.Group,
                    new mongo.ObjectId(parent.id),
                    "applicationState",
                );

                if (applicationState != null) {
                    return applicationState.requiredAssociation;
                } else {
                    return null;
                }
            },
        }
    }
];

export const group: GraphqlDef = mergeGraphqlDefs(defs);

