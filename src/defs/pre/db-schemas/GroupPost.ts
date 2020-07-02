import {HasIssuedDate, HasLastModifiedAt, HasMongoId} from "./bases";
import mongo from "mongodb";
import {GroupPostState} from "../enums/GroupPostState";
import {S3Key} from "../simple-types";

export interface GroupPost extends HasMongoId, HasIssuedDate, HasLastModifiedAt
{
    author: mongo.ObjectId;
    state: GroupPostState;
    title: string;
    body: string;
    images: S3Key[];
    comments: GroupPostComment[];
}

export interface GroupPostComment extends HasMongoId, HasIssuedDate, HasLastModifiedAt
{
    author: mongo.ObjectId;
    body: string;
}
