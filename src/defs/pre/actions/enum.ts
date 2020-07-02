import {GraphqlDef} from "./graphql-aggregate";
import {toPascal, toUpperSnake} from "./name";

export function graphqlEnumDef(
    name: string,
    items: string[],
    resolver: any,
): GraphqlDef {
    return {
        typeDefs: `enum ${toPascal(name)} { ${items.map(item => toUpperSnake(item)).join(", ")} }`,
        resolvers: {
            [toPascal(name)]: resolver,
        }
    }
}
