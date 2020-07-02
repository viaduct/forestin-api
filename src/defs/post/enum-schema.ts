import {GraphqlDef, mergeGraphqlDefs} from "../pre/graphql-aggregate";
import {createDictForStudentVerificationState, StudentVerificationStateCol} from "../pre/enums/StudentVerificationState";
import {createDictForPasswordState, PasswordStateCol} from "../pre/enums/PasswordState";
import {createDictForEmailState, EmailStateCol} from "../pre/enums/EmailState";

const defs: GraphqlDef[] = [
    graphqlEnumDef(
        "student verification state",
        [
            "pending",
            "verified",
            "rejected",
        ],
        createDictForStudentVerificationState(
            StudentVerificationStateCol.Name,
            StudentVerificationStateCol.Kind
        ),
    ),
    graphqlEnumDef(
        "password state",
        [
            "valid",
            "no digit",
            "no latin alphabet",
            "too short",
        ],
        createDictForPasswordState(
            PasswordStateCol.Name,
            PasswordStateCol.Kind,
        ),
    ),
    graphqlEnumDef(
        "email state",
        ["new", "used", "invalid"],
        createDictForEmailState(
            EmailStateCol.Name,
            EmailStateCol.Kind,
        ),
    ),
];

export const graphqlEnum: GraphqlDef = mergeGraphqlDefs(defs);

function graphqlEnumDef(
    name: string,
    items: string[],
    resolver: any,
): GraphqlDef
{
    return {
        typeDefs: `enum ${toPascal(name)} { ${items.map(item=>toUpperPascal(item)).join(", ")} }`,
        resolvers: {
            [toPascal(name)]: resolver,
        }
    }
}

function toPascal(
    name: string,
    isCapital: boolean = true,
    result: string = ""
): string
{
    if ( name.length != 0 )
    {
        const cur = name[0];

        if ( cur == " " )
        {
            return toPascal(name.slice(1), true, result)
        }
        else // cur is just a lower-case letter.
        {
            const target = isCapital ? cur.toUpperCase() : cur;
            return toPascal(name.slice(1), false, result + target);
        }
    }
    else
    {
        return result;
    }
}

function toUpperPascal(
    name: string,
    result: string = "",
): string
{
    if ( name.length != 0 )
    {
        const cur = name[0];

        if ( cur == " " )
        {
            return toUpperPascal(name.slice(1), result + "_");
        }
        else
        {
            return toUpperPascal(name.slice(1), result + cur.toUpperCase());
        }
    }
    else
    {
        return result;
    }
}


