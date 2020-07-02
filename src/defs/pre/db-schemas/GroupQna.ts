import {HasIssuedDate, HasLastModifiedAt, HasMongoId} from "./bases";
import mongo from "mongodb";

export interface GroupQna extends HasMongoId, HasIssuedDate, HasLastModifiedAt
{
    author: mongo.ObjectId;
    body: string;
    answer?: string;
}
