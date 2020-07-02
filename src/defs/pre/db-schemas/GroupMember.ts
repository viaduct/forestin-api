import mongo from "mongodb";
import {HasIssuedDate, HasLastModifiedAt, HasMongoId} from "./bases";
import {GroupMemberKind} from "../enums/GroupMemberKind";

export interface GroupMember extends HasMongoId, HasIssuedDate, HasLastModifiedAt
{
    group: mongo.ObjectId;
    user: mongo.ObjectId;
    kind: GroupMemberKind;
}
