import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.GroupVote, "issuedDate"),
    lastModifiedAt: createGqlFindField(CollecKind.GroupVote, "lastModifiedAt"),
    group: createGqlFindField(CollecKind.GroupVote, "group", true),
    author: createGqlFindField(CollecKind.GroupVote, "author", true),

    choices: async (a: any, b: any, c: any)=>{
        function choiceMap(raw: {_id: string; value: string;}): {id: string; value: string}
        {
            return {
                id: raw._id,
                value: raw.value,
            };
        }

        const unmappedResult = await Promise.resolve(createGqlFindField(CollecKind.GroupVote, "choices")(a, b, c));
        return unmappedResult.map(choiceMap);
    } /* todo */,
    targets: createGqlFindField(CollecKind.GroupVote, "targets", true, true),
    allowMultipleChoices: createGqlFindField(CollecKind.GroupVote, "allowMultipleChoices"),
    isAnonymous: createGqlFindField(CollecKind.GroupVote, "isAnonymous"),
    decisions: createGqlFindField(CollecKind.GroupVote, "decisions"),
    title: createGqlFindField(CollecKind.GroupVote, "title"),
    body: createGqlFindField(CollecKind.GroupVote, "body"),
    deadline: createGqlFindField(CollecKind.GroupVote, "deadline"),
};
