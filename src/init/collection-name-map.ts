import {CollecKind} from "../enums";

export interface FindName
{
    (kind: CollecKind): string;
}

interface CollectionNameMapOptions
{
}

interface CollectionNameMap
{
    findName: FindName;
}

const collectionKindData = [
    [CollecKind.User, "Users"],
    [CollecKind.StudentVerification, "StudentVerifications"],
    [CollecKind.Association, "Associations"],
];

const collectionKindToName = Object.fromEntries(collectionKindData);

function findCollectionName(kind: CollecKind): string
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
