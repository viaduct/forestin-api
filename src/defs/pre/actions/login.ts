import mongo from "mongodb";
import jwt from "jsonwebtoken";
import {upload} from "../aws-upload";
import {toGraphqlUpload} from "../GraphqlUpload";
import {FindName} from "../../../init/collection-name-map";
import {Context} from "../Context";
import {StudentVerificationState} from "../enums/StudentVerificationState";
import {jsDateToString} from "./date-cast";
import {findFromPasswordState, PasswordState, PasswordStateCol} from "../enums/PasswordState";
import {EmailState, EmailStateCol, findFromEmailState} from "../enums/EmailState";
import {findFromSignUpErrorKind, SignUpErrorKind, SignUpErrorKindCol} from "../enums/SignUpErrorKind";
import {Gender} from "../enums/Gender";
import {CollectionKind} from "../enums/CollectionKind";
import {AssociationId, DayPrecDate, PhoneNumber, UserName, Year, Year2} from "../simple-types";
import {TokenData} from "../TokenData";

export async function signIn(
    context: Context,
    email: string,
    pw: string
): Promise<string>
{
    const {privateKey, tokenLifetime, db, collectionNameMap: findName} = context;

    // Search for the user.
    const filter = {
        email: email,
        password: pw,
    };
    const theUserArray = await db.collection(findName(CollectionKind.User))
        .find(filter).project({_id: 1}).toArray();
    const exists = theUserArray.length == 1;
    const theUser = exists ? theUserArray[0] : null;

    if ( exists )
    {
        const data = {
            email: email,
            password: pw,
            id: theUser._id.valueOf(),
        };
        const token = jwt.sign(
            data,
            privateKey,
            {
                expiresIn: tokenLifetime,
            }
        );
        return token;
    }
    else
    {
        throw new Error("Login information mismatch.");
    }
}

export async function refreshToken(
    context: Context,
    token: string
): Promise<string>
{
    const {privateKey, tokenLifetime} = context;

    // Take informations.
    const {email, password, id} = jwt.verify(token, privateKey) as any;

    // Re-create jwt token.
    const data = {
        email: email,
        password: password,
        id: id,
    };
    const newToken = jwt.sign(
        data,
        privateKey,
        {
            expiresIn: tokenLifetime,
        }
    );

    return newToken;
}

export async function signUpEmailCheck(context: Context, email: string): Promise<EmailState>
{
    const {db, collectionNameMap: findName} = context;

    // Check invalidation.
    function validateEmail(email: string): boolean
    {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }

    if ( !validateEmail(email) )
    {
        return EmailState.Invalid;
    }

    // Check existance.
    const exists = (await db
        .collection(findName(CollectionKind.User))
        .find({email: email})
        .project({_id: 1})
        .toArray()).length != 0;

    if ( exists )
    {
        return EmailState.Used;
    }
    else
    {
        return EmailState.New;
    }
}

export function signUpPasswordCheck(password: string): PasswordState
{
    if ( password.length < 4 )
    {
        return PasswordState.TooShort;
    }
    else if ( !/\d/.test(password) )
    {
        return PasswordState.NoDigit;
    }
    else if ( !/[a-zA-Z]/.test(password) )
    {
        return PasswordState.NoLatinAlphabet;
    }
    else
    {
        return PasswordState.Valid;
    }
}

// export async function signUpWithContext(
//     context: Context,
//     email: string,
//     password: string,
//     passFormId: unknown,
// )
// {
//     return await signUp(
//         context,
//         context.db,
//         context.collectionNameMap,
//         email,
//         password,
//         passFormId,
//     );
// }

export async function signUp(
    context: Context,
    email: string,
    password: string,
    passFormId: unknown
)
{
    const {db, collectionNameMap: findName} = context;

    // Do email and password validation.
    const passwordState = signUpPasswordCheck(password);
    const emailState = await signUpEmailCheck(context, email);
    const passwordIsValid = passwordState == PasswordState.Valid;
    const emailIsValid = emailState == EmailState.New;

    const signUpErrorName = (kind: SignUpErrorKind)=>findFromSignUpErrorKind(
        SignUpErrorKindCol.Kind,
        SignUpErrorKindCol.Name,
        kind,
    );
    const passwordStateName = (kind: PasswordState)=>findFromPasswordState(
        PasswordStateCol.Kind,
        PasswordStateCol.Name,
        kind
    );
    const emailStateName = (kind: EmailState)=>findFromEmailState(
        EmailStateCol.Kind,
        EmailStateCol.Name,
        kind
    );
    // If email is the problem, throw.
    if ( !passwordIsValid )
    {
        throw {
            signUpErrorKind: signUpErrorName(SignUpErrorKind.InsufficientPassword),
            passwordState: passwordStateName(passwordState),
        };
    }
    if ( !emailIsValid )
    {
        throw {
            signUpErrorKind: signUpErrorName(SignUpErrorKind.InsufficientEmail),
            emailState: emailStateName(emailState),
        };
    }

    // Prepare pass form data.
    const passFormInst = await passForm(passFormId);

    // Put to the database.
    const data = {
        name: passFormInst.name,
        birthday: passFormInst.birthday,
        phoneNumber: passFormInst.phoneNumber,
        email: email,
        studentVerifications: [],
        password: password,
    };
    const colUser = db.collection(findName(CollectionKind.User));
    await colUser.insertOne(data);
}

interface PassForm
{
    name: UserName,
    birthday: DayPrecDate, // yyyy-mm-dd
    phoneNumber: PhoneNumber,
    gender: Gender,
}

async function passForm(passFormId: any): Promise<PassForm>
{
    // TODO
    return {
        name: "홍길동",
        birthday: "1990-01-01",
        phoneNumber: "01012341234",
        gender: Gender.Male,
    };
}

function fullAdmissionYear(year: Year2): Year
{
    if ( year.length == 2 )
    {
        const yearInNum = Number(year);
        if ( yearInNum >= 70)
        {
            return "19" + year;
        }
        else
        {
            return "20" + year;
        }
    }
    else if ( year.length == 4 )
    {
        return year;
    }
    else
    {
        throw new Error("Invalid year format.")
    }
}

export async function requestStudentVerification(
    context: Context,
    userId: mongo.ObjectId,
    majorIds: AssociationId[],
    incompleteAdmissionYear: string,
    evidences: any[]/* raw GraphQL Upload objects */
)
{
    const {db, collectionNameMap: findName, s3, defaultS3BucketName: bucketName} = context;

    // Prepare variables.
    const admissionYear = fullAdmissionYear(incompleteAdmissionYear);

    // Upload evidences to S3.
    async function uploadEvidences(
        s3: any,
        evidences: any[],
        result: string[] = [],
    ): Promise<string[]>
    {
        if ( evidences.length != 0 )
        {
            const [evidence, ...evidenceTail] = evidences;

            // Convert raw graphql upload to wrapped version.
            const concreteEvidence = toGraphqlUpload(evidence);

            // Actually upload, and take key.
            const {key} = await upload({
                s3: s3,
                mime: concreteEvidence.mime,
                stream: concreteEvidence.createReadStream(),
                bucketName: bucketName,
            });

            // Accumulate.
            return uploadEvidences(
                s3,
                evidenceTail,
                [...result, key],
            );
        }
        else
        {
            return result;
        }
    }
    const evidenceKeys = await uploadEvidences(s3, evidences);

    // Prepare data.
    const now = jsDateToString(new Date(Date.now()));
    const data = {
        issuedDate: now,
        majors: majorIds,
        admissionYear: admissionYear,
        evidences: evidenceKeys,
        state: StudentVerificationState.Pending,
    };

    // Apply to the database.
    const colVerifs = db.collection(findName(CollectionKind.StudentVerification));
    await colVerifs.insertOne(data);
}

// Returns userId or auth.
// export async function userIdOrAuth(
//     userId: mongo.ObjectId | null | undefined,
//     tokenData: TokenData | null | undefined,
// ): Promise<mongo.ObjectId>
// {
//     if (
//         ((userId != null) && (tokenData != null)) &&
//         (userId.equals(tokenData.id))
//     )
//     {
//         return userId;
//     }
//     // Only tokenData is provided.
//     else if (
//         (userId == null) && (tokenData != null)
//     )
//     {
//         return tokenData.id;
//     }
//     else
//     {
//         throw new Error("Have no access right.");
//     }
// }
//
// export function mongoIdOrNull(textId: string | null | undefined): mongo.ObjectId | null
// {
//     if ( (textId != null) && (textId.length != 0) )
//     {
//         return new mongo.ObjectId(textId);
//     }
//     else
//     {
//         return null;
//     }
// }
