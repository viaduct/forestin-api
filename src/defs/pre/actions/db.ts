import mongo from "mongodb";
import {CollectionKind} from "../enums/CollectionKind";
import {FindName} from "../../../init/collection-name-map";
import {Context} from "../Context";

export function noIdProject(project: any)
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

export async function dbObjProps(
    context: Context,
    collectionKind: CollectionKind,
    id: mongo.ObjectId,
    project: any,
): Promise<any> {
    const {db, collectionNameMap: findName} = context;

    const queryResult = await db.collection(findName(collectionKind)).findOne({_id: id}, noIdProject(project));

    return queryResult;
}

export async function dbObjProp(
    context: Context,
    collectionKind: CollectionKind,
    id: mongo.ObjectId,
    propName: string,
): Promise<any> {
    const props = await dbObjProps(
        context, collectionKind, id, {[propName]: 1},
    );

    return props[propName];
}

export function createDbObjPropForGraphql(
    collectionKind: CollectionKind,
    propName: string,
    caster: Function = (a: any) => a,
): Function {
    return async (parent: { id: string }, _: any, context: Context) => {
        return caster(
            await dbObjProp(
                context,
                collectionKind,
                new mongo.ObjectId(parent.id),
                propName
            )
        );
    };
}

export function createDbNestedObjpropForGraphql(
    collectionKind: CollectionKind,
    path: string,
    propName: string,
    caster: Function = (a: any)=>a,
): Function
{
    return async (parent: {id: string}, _: any, context: Context)=>{
        const uncastedResult = await context.db
            .collection(context.collectionNameMap(collectionKind))
            .findOne(
                {[`${path}._id`]: new mongo.ObjectId(parent.id)},
                {_id: 0, [propName]: 1} as any,
            ) as any;
        return caster(uncastedResult);
    };
}
