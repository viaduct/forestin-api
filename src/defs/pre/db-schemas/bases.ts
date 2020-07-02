import mongo from "mongodb";

export interface HasMongoId {
    _id: mongo.ObjectId;
}

export interface HasIssuedDate {
    issuedDate: Date;
}

export interface HasLastModifiedAt {
    lastModifiedAt: Date;
}

export interface HasSafeDelete {
    isDeleted: boolean;
}
