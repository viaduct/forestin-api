export function reversePairs<M, N>(arr: [M, N][]): [N, M][]
{
    return arr.map(([a, b])=>[b, a]);
}

export enum CollectionKind {
    User,
    StudentVerification,
    Association,
}

