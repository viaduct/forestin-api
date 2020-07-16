import {CollecKind} from "./enums";
import {Context} from "./context";
import mongo from "mongodb";

export async function create(c: Context, colKind: CollecKind, data: any)
{
    await c.mongo.collec(colKind).insertOne(data);
}

export async function update(
    c: Context,
    colKind: CollecKind,
    id: mongo.ObjectId,
    newData: any
)
{
    await c.mongo.collec(colKind).updateOne(
        {_id: id},
        {$set: newData},
    );
}

export async function destroy(
    c: Context,
    colKind: CollecKind,
    id: mongo.ObjectId,
)
{
    await c.mongo.collec(colKind).deleteOne({_id: id});
}

export async function findField(
    c: Context,
    colKind: CollecKind,
    id: mongo.ObjectId,
    fieldName: string,
): Promise<any>
{
    return (await c.mongo.collec(colKind).findOne({_id: id}))[fieldName];
}

export function createGqlFindField(
    colKind: CollecKind,
    fieldName: string
): Function
{
    return async function(
        {id}: any,
        _: any,
        c: Context
    )
    {
        return await findField(
            c,
            colKind,
            new mongo.ObjectId(id),
            fieldName,
        );
    };
}
