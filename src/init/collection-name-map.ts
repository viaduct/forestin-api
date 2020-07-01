import {CollectionKind} from "../defs/pre/defines";

export interface FindName
{
    (kind: CollectionKind): string;
}

interface CollectionNameMapOptions
{
}

interface CollectionNameMap
{
    findName: FindName;
}

const collectionKindData = [
    [CollectionKind.User, "Users"],
    [CollectionKind.StudentVerification, "StudentVerifications"],
    [CollectionKind.Association, "Associations"],
];

const collectionKindToName = Object.fromEntries(collectionKindData);

function findCollectionName(kind: CollectionKind): string
{
    return collectionKindToName[kind];
}

export async function init(options: CollectionNameMapOptions): Promise<CollectionNameMap>
{
    console.log("Initializing the module collection-name-map...");

    return {
        findName: collectionKindToName,
    };
}
