import {Context} from "../Context";
import {CollectionKind} from "../enums/CollectionKind";
import mongo from "mongodb";
import {dbObjProp, noIdProject} from "./db";
import {AssociationId, AssociationLevel, RawMongoId} from "../simple-types";
import {
    AssociationLevelKind,
    AssociationLevelKindCol,
    findFromAssociationLevelKind
} from "../enums/AssociationEnumKind";

export async function associationNameForGraphql(
    parent: { id: string },
    _: any,
    context: Context
): Promise<any> {
    const {db, collectionNameMap: findName} = context;

    const obj = await db
        .collection(findName(CollectionKind.Association))
        .findOne({associationId: parent.id}, {name: 1} as any) as any;

    return obj.name;
}

export async function associationChildrenForGraphql(
    parent: { id: string },
    _: any,
    context: Context
): Promise<any> {
    const {db, collectionNameMap: findName} = context;

    const children = await db
        .collection(findName(CollectionKind.Association))
        .find({parent: parent.id})
        .project({associationId: 1})
        .toArray();

    return children.map(child => child.associationId);
}

export async function associationParentForGraphql(
    parent: { id: RawMongoId },
    _: any,
    context: Context
): Promise<any> {
    const parentAssoc = await dbObjProp(
        context,
        CollectionKind.Association,
        new mongo.ObjectId(parent.id),
        "parent",
    );

    return parentAssoc;
}

export async function associationProps(
    context: Context,
    associationId: AssociationId,
    project: any,
): Promise<any>
{
    const {db, collectionNameMap: findName} = context;
    const assoc = await db
        .collection(findName(CollectionKind.Association))
        .findOne(
            {associationId: associationId},
            noIdProject(project) as any,
        ) as any;

    return assoc;
}

export async function associationParentAtLevel(
    context: Context,
    associationId: AssociationId,
    parentLevel: AssociationLevel,
): Promise<AssociationId>
{
    // Get level first.
    const {level: curLevel} = await associationProps(context, associationId, {level: 1});

    // Get level diff. If asked level is larger than the current one, throw.
    const diff = curLevel - parentLevel;
    if ( diff < 0 )
    {
        throw new Error("Parent level is larger than children's one.");
    }

    // Do recursive getting-parent.
    async function getParent(child: AssociationId): Promise<AssociationId>
    {
        return (await associationProps(context, child, {parent: 1})).parent;
    }
    async function callNTimes(f: Function, v: any, n: number)
    {
        let cur = v;
        for ( let i = 0; i < n; ++i )
        {
            cur = await f(cur);
        }
        return cur;
    }

    return await callNTimes(getParent, associationId, diff);
}

export function associationKindToLevel(kind: AssociationLevelKind): AssociationLevel
{
    return findFromAssociationLevelKind(
        AssociationLevelKindCol.Kind,
        AssociationLevelKindCol.Level,
        kind,
    );
}
