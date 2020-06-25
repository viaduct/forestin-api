import mongo from "mongodb";
import {CollectionKind, collectionName, isThereAnyCandidate} from "./db";
import {assignOrDefault} from "./util";

export async function universities(db: mongo.Db): Promise<Association[]>
{
    return await level1Associations(db);
}

export async function campuses(db: mongo.Db, parentId: AssociationId): Promise<Association[]>
{
    return await children(db, parentId);
}

export async function colleges(db: mongo.Db, parentId: AssociationId): Promise<Association[]>
{
    return await children(db, parentId);
}

export async function majors(db: mongo.Db, parentId: AssociationId): Promise<Association[]>
{
    return await children(db, parentId);
}

export async function parents(db: mongo.Db, id: AssociationId | null, result: Association[] = []): Promise<Association[]>
{
    if ( id != null )
    {
        const currentAssociation = await association(db, id);
        return await parents(
            db,
            currentAssociation.parent,
            [currentAssociation, ...result],
        );
    }
    else
    {
        return result;
    }
}

export async function add(db: mongo.Db, associationKind: AssociationKind, value: any)
{
    // Required fields.
    const id: AssociationId = value.id;

    // Optional fields.
    const name: string = assignOrDefault(value.name, "");
    const parentId: AssociationId | null = assignOrDefault(value.parent, null);

    // Prepared fields.
    const parent: Association | null = await (async function(){
        if ( parentId != null )
        {
            return association(db, parentId);
        }
        else
        {
            return null;
        }
    })();

    // Check prior conditions.
    // If the id duplicated, fails.
    if ( await doesAssociationExist(db, id) )
    {
        throw new Error("Association id duplication detected.");
    }

    // Do insertion.
    const collection = db.collection(collectionName(CollectionKind.Association));
    collection.insertOne({
        name: name,
        parent: parentId,
        associationId: id,
        level: parent != null ? parent.level + 1 : 1,
    });
}

export async function update(db: mongo.Db, value: any)
{
    // Prepared fields.
    const {id, name} = value;

    // Make DB call.
    const filter = {
        associationId: id,
    };

    const update: any = {};
    if ( name != null )
    {
        update["name"] = name;
    }

    const collection = db.collection(collectionName(CollectionKind.Association));
    await collection.updateOne(filter, update);
}

export enum AssociationKind
{
    University,
    Campus,
    College,
    Major,
}

export type AssociationId = string;

async function level1Associations(db: mongo.Db): Promise<Association[]>
{
    const collection = db.collection(collectionName(CollectionKind.Association));
    const filter = {
        level: 1,
    };
    return await collection.find(filter).toArray();
}

async function children(db: mongo.Db, parentId: AssociationId): Promise<Association[]>
{
    // Get collection of Associations first.
    const collection = db.collection(collectionName(CollectionKind.Association));

    // Query from mongodb.
    const children: Association[] = await collection
        .find({parent: parentId})
        .toArray();

    return children;
}

export interface Association
{
    name: string;
    associationId: AssociationId;
    level: number;
    parent: AssociationId | null;
}

export async function association(db: mongo.Db, id: AssociationId): Promise<Association>
{
    // Get collection of Associations first.
    const collection = db.collection(collectionName(CollectionKind.Association));

    // Query from mongodb.
    const associations: Association[] = await collection
        .find({associationId: id})
        .toArray();

    if ( associations.length == 0 )
    {
        throw new Error("No association found.");
    }
    else if ( associations.length > 1 )
    {
        throw new Error("Multiple associations found. Must be DB is ill-formed.");
    }

    return associations[0];
}

async function doesAssociationExist(db: mongo.Db, id: AssociationId): Promise<boolean>
{
    return await isThereAnyCandidate(db, CollectionKind.Association, {associationId: id});
}
//
// type InsertAssociationOptions =
//     Pick<Association,
//         // Mandatory
//         "associationId"
//     > &
//     Pick<Partial<Association>,
//         // Allowed
//         "name" |
//         "parent" |
//         "isOnlyChild"
//     >;
//
// interface InsertAssociationContext extends Association
// {
//     preparedParent: Association;
// }
//
// function deduceLevel(
//     parent: Pick<Association, "level"> | null,
// ): number
// {
//     if ( parent != null )
//     {
//         // Level is not given but we have parent, so return parent.level + 1.
//         return parent.level + 1;
//     }
//     else
//     {
//         // The default level is 1.
//         return 1;
//     }
// }
//
// async function deduceInsertAssociationContext(
//     db: mongo.Db,
//     options: InsertAssociationOptions
// ): Promise<InsertAssociationContext>
// {
//     const preparedParent: Association = await propsByFilter(
//         db,
//         CollectionKind.Association,
//         {associationId: options.parent},
//         {
//             "name": 1,
//             "associationLevel": 1,
//             "level": 1,
//             "parent": 1,
//             "isOnlyChild": 1,
//         }
//     );
//
//     return {
//         name: assignOrDefault(options.name, ""),
//         associationId: options.associationId,
//         level: deduceLevel(preparedParent),
//         parent: assignOrDefault(options.parent, null),
//         isOnlyChild: assignOrDefault(options.isOnlyChild, false),
//         preparedParent: preparedParent,
//     };
// }
//
//
// async function isAssociationIdExists(db: mongo.Db, associationId: AssociationId): Promise<boolean>
// {
//     // Get anyone with the given associationId from db.
//     const hasCandidate = await isThereAnyCandidate(
//         db,
//         CollectionKind.Association,
//         {associationId: associationId}
//     );
//
//     return hasCandidate;
// }
//
// async function hasChild(db: mongo.Db, parentId: AssociationId): Promise<boolean>
// {
//     // Find any associations with the same parent.
//     const hasChild = await isThereAnyCandidate(
//         db,
//         CollectionKind.Association,
//         {parent: parentId},
//     );
//
//     return hasChild;
// }
//
// async function add(db: mongo.Db, options: InsertAssociationOptions)
// {
//     // Prepare context.
//     const context = await deduceInsertAssociationContext(db, options);
//
//     // 1. Find any duplication of same id.
//     if ( await isAssociationIdExists(db, context.associationId) )
//     {
//         throw new Error("Association id duplicated.");
//     }
//
//     // 2. When isOnlyChild is true for top level association.
//     if ( (context.level == 1) && context.isOnlyChild )
//     {
//         throw new Error("Top level association cannot be an only child.");
//     }
//
//     // 4. When onlyChild is true for a parent which already has at least one child.
//     {
//         if ( context.parent != null )
//         {
//             if ( await hasChild(db, context.parent) )
//             {
//                 throw new Error("isOnlyChild is true, but the parent already has its children.");
//             }
//         }
//     }
//
//     // Finally, do insertion.
//     const collection = db.collection(collectionName(CollectionKind.Association));
//     await collection
//         .insertOne({
//             name: context.name,
//             associationId: context.associationId,
//             level: context.level,
//             parent: context.parent,
//             isOnlyChild: context.isOnlyChild,
//         });
// }
//
// type UpdateAssociationOptions =
//     Pick<Association,
//         // Mandatory
//         "associationId"
//         > &
//     Pick<Partial<Association>,
//         // Allowed
//         "name" |
//         "parent" |
//         "isOnlyChild"
//         >;
//
// interface UpdateAssociationContext extends Association
// {
//     preparedParent: Association;
// }
//
// async function deduceUpdateAssociationContext(
//     db: mongo.Db,
//     options: UpdateAssociationOptions
// ): Promise<UpdateAssociationContext>
// {
//     const preparedParent: Association = await propsByFilter(
//         db,
//         CollectionKind.Association,
//         {associationId: options.parent},
//         {
//             "name": 1,
//             "associationLevel": 1,
//             "level": 1,
//             "parent": 1,
//             "isOnlyChild": 1,
//         }
//     );
//
//     return {
//         name: assignOrDefault(options.name, ""),
//         associationId: options.associationId,
//         level: deduceLevel(preparedParent),
//         parent: assignOrDefault(options.parent, null),
//         isOnlyChild: assignOrDefault(options.isOnlyChild, false),
//         preparedParent: preparedParent,
//     };
// }
//
// async function update(db: mongo.Db, options: UpdateAssociationOptions)
// {
//     // Prepare context.
//     const context = await deduceUpdateAssociationContext(db, options);
//
//     // 1. The given association id must be exist.
//     if ( (await isAssociationIdExists(db, context.associationId)) == false )
//     {
//         throw new Error("Association id is not found.");
//     }
//
//     // 2. When isOnlyChild is true for top level association.
//     if ( (context.level == 1) && context.isOnlyChild )
//     {
//         throw new Error("Top level association cannot be an only child.");
//     }
//
//     // 4. When onlyChild is true for a parent which already has at least one child.
//     {
//         if ( context.parent != null )
//         {
//             if ( await hasChild(db, context.parent) )
//             {
//                 throw new Error("isOnlyChild is true, but the parent already has its children.");
//             }
//         }
//     }
// }
