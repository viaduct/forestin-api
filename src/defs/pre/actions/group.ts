import {Context} from "../Context";
import mongo from "mongodb";
import {Group} from "../db-schemas/Group";
import {dbObjProp} from "./db";
import {CollectionKind} from "../enums/CollectionKind";
import {valueInRange} from "./util";

export async function isGroupApplicable(
    context: Context,
    groupId: mongo.ObjectId,
    now: number,
): Promise<boolean> {
    const group: Partial<Group> = await dbObjProp(context, CollectionKind.Group, groupId, "applicationState");

    if (group.applicationState != null) {
        const fromValue = group.applicationState.applicableFrom.valueOf();
        const toValue = group.applicationState.applicableTo.valueOf();

        return valueInRange(fromValue, toValue, now);
    } else {
        return false;
    }
}
