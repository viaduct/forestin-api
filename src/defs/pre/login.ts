import mongo from "mongodb";
import {AssociationId} from "../univ";
import jwt from "jsonwebtoken";
import {upload} from "./aws-upload";
import {toGraphqlUpload} from "./graphql-upload";
import {CollectionKind} from "./defines";
import {FindName} from "../../init/collection-name-map";
import {Context} from "./Context";
import {StudentVerificationState} from "./StudentVerificationState";
import {jsDateToString} from "./date-cast";
import {PasswordState, passwordStateToString} from "./PasswordState";
import {EmailState, emailStateToString} from "./EmailState";

export async function signInWithContext(
    context: Context,
    email: string,
    password: string,
): Promise<string>
{
    return await signIn(
        context.privateKey,
        context.tokenLifetime,
        context.db,
        context.collectionNameMap,
        email,
        password
    );
}

async function signIn(
    privateKey: string,
    tokenLifetime: number,
    db: mongo.Db,
    findName: FindName,
    email: string,
    pw: string
): Promise<string>
{
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

export async function refreshTokenWithContext(
    context: Context,
    token: string,
): Promise<string>
{
    return await refreshToken(
        context.privateKey,
        context.tokenLifetime,
        context.db,
        token,
    );
}

async function refreshToken(
    privateKey: string,
    tokenLifetime: number,
    db: mongo.Db,
    token: string
): Promise<string>
{
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

export interface TokenData
{
    id: mongo.ObjectId,
    password: string,
    email: string,
}

export async function tokenData(privateKey: string, token: string): Promise<TokenData>
{
    const {email, password, id} = jwt.verify(token, privateKey) as any;

    const mongoUserId = new mongo.ObjectId(id);

    return {
        id: mongoUserId,
        email: email,
        password: password,
    };
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

enum SignUpErrorKind
{
    InsufficientPassword,
    InsufficientEmail,
    InsufficientPassForm,
    UnknownError,
}

const signUpToString_object = {
    [SignUpErrorKind.InsufficientPassword]: "INSUFFICIENT_PASSWORD",
    [SignUpErrorKind.InsufficientEmail]: "INSUFFICIENT_EMAIL",
    [SignUpErrorKind.InsufficientPassForm]: "INSUFFICIENT_PASS_FORM",
    [SignUpErrorKind.UnknownError]: "UNKNOWN_ERROR",
}

export async function signUpWithContext(
    context: Context,
    email: string,
    password: string,
    passFormId: unknown,
)
{
    return await signUp(
        context,
        context.db,
        context.collectionNameMap,
        email,
        password,
        passFormId,
    );
}

async function signUp(
    context: Context,
    db: mongo.Db,
    findName: FindName,
    email: string,
    password: string,
    passFormId: unknown
)
{
    // Do email and password validation.
    const passwordState = signUpPasswordCheck(password);
    const emailState = await signUpEmailCheck(context, email);
    const passwordIsValid = passwordState == PasswordState.Valid;
    const emailIsValid = emailState == EmailState.New;

    // If email is the problem, throw.
    if ( !passwordIsValid )
    {
        throw {
            signUpErrorKind: signUpToString_object[SignUpErrorKind.InsufficientPassword],
            passwordState: passwordStateToString(passwordState),
        };
    }
    if ( !emailIsValid )
    {
        throw {
            signUpErrorKind: signUpToString_object[SignUpErrorKind.InsufficientEmail],
            emailState: emailStateToString(emailState),
        };
    }
    // // If anything fails, throw.
    // if ( !(passwordIsValid && emailIsValid) )
    // {
    //     throw new Error("Email or password is not valid.");
    // }

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

export enum Gender
{
    Male, Female, Others
}

interface PassForm
{
    name: string,
    birthday: string, // yyyy-mm-dd
    phoneNumber: string,
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

function fullAdmissionYear(year: string): string
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
    db: mongo.Db,
    findName: FindName,
    s3: any,
    bucketName: string,
    userId: mongo.ObjectId,
    majorIds: AssociationId[],
    incompleteAdmissionYear: string,
    evidences: any[]/* raw GraphQL Upload objects */
)
{
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
    // Both valid and match.
}

// Returns userId or auth.
export async function userIdOrAuth(
    userId: mongo.ObjectId | null | undefined,
    tokenData: TokenData | null | undefined,
): Promise<mongo.ObjectId>
{
    if (
        ((userId != null) && (tokenData != null)) &&
        (userId.equals(tokenData.id))
    )
    {
        return userId;
    }
    // Only tokenData is provided.
    else if (
        (userId == null) && (tokenData != null)
    )
    {
        return tokenData.id;
    }
    else
    {
        throw new Error("Have no access right.");
    }
}

export function mongoIdOrNull(textId: string | null | undefined): mongo.ObjectId | null
{
    if ( (textId != null) && (textId.length != 0) )
    {
        return new mongo.ObjectId(textId);
    }
    else
    {
        return null;
    }
}
