export interface GraphqlDef {
    typeDefs: string;
    resolvers: any;
}

const nullGraphqlDef: GraphqlDef = {
    typeDefs: "",
    resolvers: {},
};

export function mergeGraphqlDefs(arr: GraphqlDef[]): GraphqlDef {
    return arr.reduce(merge2GraphqlDefs, nullGraphqlDef);
}

function merge2GraphqlDefs(a: GraphqlDef, b: GraphqlDef): GraphqlDef {
    return {
        typeDefs: a.typeDefs + "\n" + b.typeDefs,
        resolvers: merge2Objects(a.resolvers, b.resolvers),
    };
}

function merge2Objects(a: any, b: any): any {
    try
    {
        if ((typeof a) == "object" && (typeof b) == "object") {
            // For a props.
            const duplicatedFieldKeys = Object.entries(a).map(([key, _]) => key).filter(key => b[key] !== undefined);

            const mergedDuplicatedFieldsObj = duplicatedFieldKeys.map(key => [key, merge2Objects(a[key], b[key])]);

            return {
                ...a,
                ...b,
                ...Object.fromEntries(mergedDuplicatedFieldsObj),
            }
        } else {
            throw new Error("Non-object merge is not defined.");
        }
    }
    catch (e)
    {
        console.error(a, b);
        throw e;
    }
}
