import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {
    associationChildrenForGraphql,
    associationNameForGraphql,
    associationParentForGraphql
} from "../pre/actions/association";

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
                name: associationNameForGraphql,
                campuses: associationChildrenForGraphql,
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
                name: associationNameForGraphql,
                college: associationParentForGraphql,
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
                name: associationNameForGraphql,
                colleges: associationChildrenForGraphql,
                university: associationParentForGraphql,
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
                name: associationNameForGraphql,
                campus: associationParentForGraphql,
                majors: associationChildrenForGraphql,
            },
        },
    },
];

export const association: GraphqlDef = mergeGraphqlDefs(associationDefs);

