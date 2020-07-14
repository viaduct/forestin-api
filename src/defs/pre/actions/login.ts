import mongo from "mongodb";
import jwt from "jsonwebtoken";
import {
    destroyFile,
    FileUsedByStudentVerification,
    FileUsedByUserAvatar,
    FileUserKind,
    uploadFile
} from "../aws-upload";
import {toGraphqlUpload} from "../GraphqlUpload";
import {Context} from "../Context";
import {findFromPasswordState, PasswordState, PasswordStateCol} from "../enums/PasswordState";
import {EmailState, EmailStateCol, findFromEmailState} from "../enums/EmailState";
import {findFromSignUpErrorKind, SignUpErrorKind, SignUpErrorKindCol} from "../enums/SignUpErrorKind";
import {Gender} from "../enums/Gender";
import {CollectionKind} from "../enums/CollectionKind";
import {DayPrecDate, Email, Password, PhoneNumber, RawMongoId, Token, UserName, Year, Year2} from "../simple-types";
import {Context2, ContextualTokenDataKind, UserContextualTokenData} from "../context-2/Context2";
import {
    passwordVldResultByPassedCount,
    passwordVldResultNames,
    vldDayPrecDate,
    vldEmail,
    vldPassword,
    vldPhoneNumber,
    vldRawMongoId,
    VldResult,
    vldToken,
    vldUserName,
    vldYear
} from "../vld";
import {StudentVerification} from "../db-schemas/StudentVerification";
import {StudentVerificationState} from "../enums/StudentVerificationState";

// export async function signIn(
//     context: Context,
//     email: string,
//     pw: string
// ): Promise<string>
// {
//     const {privateKey, tokenLifetime, db, collectionNameMap: findName} = context;
//
//     // Search for the user.
//     const filter = {
//         email: email,
//         password: pw,
//     };
//     const theUserArray = await db.collection(findName(CollectionKind.User))
//         .find(filter).project({_id: 1}).toArray();
//     const exists = theUserArray.length == 1;
//     const theUser = exists ? theUserArray[0] : null;
//
//     if ( exists )
//     {
//         const data = {
//             email: email,
//             password: pw,
//             id: theUser._id.toString(),
//         };
//         const token = jwt.sign(
//             data,
//             privateKey,
//             {
//                 expiresIn: tokenLifetime,
//             }
//         );
//         return token;
//     }
//     else
//     {
//         throw new Error("Login information mismatch.");
//     }
// }

export async function refreshToken2(
    c: Context2,
    args: any
): Promise<Token>
{
    // Validate arguments.
    const tokenVr = vldToken(args.token);
    if ( !tokenVr.isPassed )
    {
        throw {
            kind: "INVALID_TOKEN"
        }
    }
    const {token}: {token: Token} = args;

    // Authorize... but it's open to everyone.

    // Take informations from jwt.
    let prevData: any;
    try {
        prevData = jwt.verify(token, c.auth.privateKey);
    }
    catch
    {
        throw {
            kind: "TOKEN_EXPIRED",
        };
    }

    // Re-create jwt token.
    const newToken = jwt.sign(
        prevData,
        c.auth.privateKey,
    );

    // Return the new token.
    return newToken;
}

// export async function refreshToken(
//     context: Context,
//     token: string
// ): Promise<string>
// {
//     const {privateKey, tokenLifetime} = context;
//
//     // Take informations.
//     const {email, password, id} = jwt.verify(token, privateKey) as any;
//
//     // Re-create jwt token.
//     const data = {
//         email: email,
//         password: password,
//         id: id,
//     };
//     const newToken = jwt.sign(
//         data,
//         privateKey,
//         {
//             expiresIn: tokenLifetime,
//         }
//     );
//
//     return newToken;
// }

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

// export async function requestStudentVerification(
//     context: Context,
//     userId: mongo.ObjectId,
//     majorIds: AssociationId[],
//     incompleteAdmissionYear: string,
//     evidences: any[]/* raw GraphQL Upload objects */
// )
// {
//     const {db, collectionNameMap: findName, s3, defaultS3BucketName: bucketName} = context;
//
//     // Prepare variables.
//     const admissionYear = fullAdmissionYear(incompleteAdmissionYear);
//
//     // Upload evidences to S3.
//     async function uploadEvidences(
//         s3: any,
//         evidences: any[],
//         result: string[] = [],
//     ): Promise<string[]>
//     {
//         if ( evidences.length != 0 )
//         {
//             const [evidence, ...evidenceTail] = evidences;
//
//             // Convert raw graphql upload to wrapped version.
//             const concreteEvidence = toGraphqlUpload(evidence);
//
//             // Actually upload, and take key.
//             const {key} = await upload({
//                 s3: s3,
//                 mime: concreteEvidence.mime,
//                 stream: concreteEvidence.createReadStream(),
//                 bucketName: bucketName,
//             });
//
//             // Accumulate.
//             return uploadEvidences(
//                 s3,
//                 evidenceTail,
//                 [...result, key],
//             );
//         }
//         else
//         {
//             return result;
//         }
//     }
//     const evidenceKeys = await uploadEvidences(s3, evidences);
//
//     // Prepare data.
//     const now = jsDateToString(new Date(Date.now()));
//     const data = {
//         issuedDate: now,
//         majors: majorIds,
//         admissionYear: admissionYear,
//         evidences: evidenceKeys,
//         state: StudentVerificationState.Pending,
//     };
//
//     // Apply to the database.
//     const colVerifs = db.collection(findName(CollectionKind.StudentVerification));
//     await colVerifs.insertOne(data);
// }

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
export async function signIn2(c: Context2, args: any): Promise<Token> {
    // Validate input.
    const vrs: [VldResult, Function][] = [
        [
            vldEmail(args.email),
            (_: any) => ({kind: "INVALID_EMAIL"}),
        ],
        [
            vldPassword(args.password),
            (a: VldResult) => ({
                kind: "INVALID_PASSWORD",
                passwordErrorKind: passwordVldResultNames[passwordVldResultByPassedCount[a.passedCount]],
            }),
        ]
    ];
    const failedVrs = vrs.filter(([vr, _]) => !vr.isPassed);
    if (failedVrs.length != 0) {
        throw failedVrs[0][1](failedVrs[0][0]);
    }

    // Authorize.
    // ... and this endpoint is open to everyone.

    // Search for the user with the given email and password.
    const {email, password}: {email: Email, password: Password} = args;
    const filter = {
        email: email,
        password: password,
    };
    const theUserArray = await c.mongo.collec(CollectionKind.User)
        .find(filter)
        .project({_id: 1})
        .limit(1)
        .toArray();
    const exists = theUserArray.length != 0;
    const theUser = exists ? theUserArray[0] : null;

    // If exists, generate token and return.
    if ( exists )
    {
        const data = {
            kind: ContextualTokenDataKind.User,
            email: email,
            password: password,
            id: theUser._id.toString(),
        };
        const token = jwt.sign(
            data,
            c.auth.privateKey,
            {
                expiresIn: c.auth.tokenLifetime,
            }
        );
        return token;
    }
    else
    {
        throw {
            kind: "NO_MATCHING_INFO"
        };
    }
}

export async function signUp2(c: Context2, args: any): Promise<{id: RawMongoId}>
{
    // Validate arguments.
    // const genderCastResult = castGender(args.gender);
    const genderCastResult = [{isPassed: true}, args.gender];
    const validationResults = [
        vldEmail(args.email),
        vldPassword(args.password),
        vldUserName(args.name),
        vldDayPrecDate(args.birthday),
        genderCastResult[0],
        vldPhoneNumber(args.phoneNumber),
    ];
    const argNames = [
        "email",
        "password",
        "name",
        "birthday",
        "gender",
        "phone number",
    ];
    const additionalErr = [
        ()=>({}),
        (passedCount: number)=>({
            passwordErr: passwordVldResultNames[passwordVldResultByPassedCount[passedCount]],
        }),
        ()=>({}),
        ()=>({}),
        ()=>({}),
        ()=>({}),
    ]
    const zippedVldResults = validationResults.map((res, i)=>[res, argNames[i], additionalErr[i]]);
    const failedVldResults = zippedVldResults.filter(([res, _, __])=>!(res as any).isPassed);
    if ( failedVldResults.length != 0 )
    {
        const theVldR = failedVldResults[0];
        throw {
            kind: "INVALID",
            invalidFieldName: theVldR[1],
            ...(theVldR[2] as any)((theVldR[0] as any).passedCount),
        };
    }
    // const failedVrs: [VldResult, number][] = validationResults
    //     .map((r, i)=>[r, i])
    //     .filter(([r, _])=>!r.isPassed);
    // if ( failedVrs.length != 0 )
    // {
    //     const [failedVld, failedVldIndex] = failedVrs[0];
    //     throw {
    //         kind: "INVALID",
    //         invalidFieldName: argNames[failedVldIndex],
    //         passwordErr: failedVldIndex == 1 ? passwordVldResultNames[passwordVldResultByPassedCount[failedVld.passedCount]] : undefined,
    //     };
    // }
    const {
        email,
        password,
        name,
        birthday,
        phoneNumber,
    }: {
        email: Email,
        password: Password,
        name: UserName,
        birthday: DayPrecDate,
        phoneNumber: PhoneNumber,
    } = args;
    const gender = genderCastResult[1];

    // Authorize... but it's open to everyone.

    // Check for duplicated phone number or email.
    const dupInfoChecks = [
        // Email check.
        (
            await c.mongo
                .collec(CollectionKind.User)
                .countDocuments(
                    {email: email},
                    {limit: 1}
                )
        ) == 0,
        // Phone number check.
        (
            await c.mongo
                .collec(CollectionKind.User)
                .countDocuments(
                    {phoneNumber: phoneNumber},
                    {limit: 1}
                )
        ) == 0,
    ];
    const matchingErrs = [
        {
            kind: "IMPROPER",
            improperFieldName: "email",
            improperErr: "DUPLICATED",
        },
        {
            kind: "IMPROPER",
            improperFieldName: "phone number",
            improperErr: "DUPLICATED",
        },
    ];
    const zippedInfoChecks = dupInfoChecks.map((dupInfo, i)=>[dupInfo, matchingErrs[i]]);
    const filteredInfoChecks = zippedInfoChecks.filter(([dupInfo, err])=>!dupInfo);
    if ( filteredInfoChecks.length != 0 )
    {
        throw filteredInfoChecks[0][1];
    }

    // Insert the document.
    const now = new Date(Date.now());
    const newObj = {
        _id: new mongo.ObjectId(),
        issuedDate: now,
        name: name,
        email: email,
        birthday: birthday,
        phoneNumber: phoneNumber,
        gender: gender,
        primaryStudentVerification: undefined,
    };
    const newId = (await c.mongo.collec(CollectionKind.User).insertOne(newObj)).insertedId;
    return {id: newId.toString()};
}

export async function updateUser(c: Context2, args: any)
{
    // Validate input.
    const vlds = [
        [
            vldPassword(args.password),
            (passedCount: number)=>({
                kind: "INVALID",
                invalidFieldName: "password",
                passwordErr: passwordVldResultNames[passwordVldResultByPassedCount[passedCount]],
            }),
        ],
        [
            vldRawMongoId(args.userId),
            ()=>({
                kind: "INVALID",
                invalidFieldName: "user id",
            }),
        ],
    ];
    const failedVlds = vlds.filter(vld=>(vld[0] as any).isPassed);
    if ( failedVlds.length != 0 )
    {
        throw (failedVlds[0][1] as any)();
    }

    // Authorize.
    const throwAuthError = ()=>{
        throw {
            kind: "UNAUTHORIZED",
        }
    };
    const tokenData = c.contextualTokenData.tokenData;
    switch ( tokenData.kind )
    {
        case ContextualTokenDataKind.Admin: break;
        case ContextualTokenDataKind.User:
            if ( args.userId === (tokenData as UserContextualTokenData).userId.toString() )
            {
                break;
            }
            else
            {
                throwAuthError();
            }
        default: throwAuthError();
    }

    // Reset password.
    const userId = new mongo.ObjectId(args.userId);
    const {matchedCount, modifiedCount} = await c.mongo.collec(CollectionKind.User).updateOne(
        {_id: userId},
        {$set: {password: args.password}},
    );

    // Check result.
    if ( !(matchedCount == modifiedCount && modifiedCount == 1) )
    {
        throw {
            type: "NO_USER"
        };
    }
}

export async function updateUserAvatar(c: Context2, args: any)
{
    // Validate
    const vlds = [
        [
            vldRawMongoId(args.userId),
            ()=>({kind: "INVALID", invalidFieldName: "user id"}),
        ],
    ];
    const failedVlds = vlds.filter(([vld, errFac])=>!(vld as any).isPassed);
    if ( failedVlds.length != 0 )
    {
        throw (failedVlds[0] as any)[1]();
    }

    // Authorize.
    const td = c.contextualTokenData.tokenData;
    switch ( td.kind )
    {
        case ContextualTokenDataKind.Admin: break;
        case ContextualTokenDataKind.User:
            if ( (td as UserContextualTokenData).userId.toString() == args.userId )
            {
                break;
            }
            else
                throw {kind: "UNAUTHORIZED"};
        default: throw {kind: "UNAUTHORIZED"};
    }

    // Get previous avatar data.
    const userId = new mongo.ObjectId(args.userId);
    const {avatar} = await c.mongo.collec(CollectionKind.User).findOne(
        {_id: userId},
        {_id: 0, avatar: 1},
    );

    // Upload photo.
    const newAvatarRawGup = args.avatar, oldAvatarId = avatar;

    if ( oldAvatarId != null )
    {
        // Delete file from the user.
        await c.mongo.collec(CollectionKind.User).updateOne(
            {_id: userId},
            {$set: {avatar: undefined}}
        );

        // Delete the old one.
        await destroyFile(c, oldAvatarId);
    }

    if ( newAvatarRawGup != null )
    {
        // Upload the new file.
        const gup = toGraphqlUpload(newAvatarRawGup);
        const [newAvatarKey] = await uploadFile(
            c,
            gup.mime,
            {kind: FileUserKind.UserAvatar, userId: userId} as FileUsedByUserAvatar,
            true,
            gup.createReadStream(),
        );

        // Update the user.
        await c.mongo.collec(CollectionKind.User).updateOne(
            {_id: userId},
            {$set: {avatar: newAvatarKey}}
        );
    }
}

export async function requestStudentVerification(c: Context2, args: any): Promise<{id: string}>
{
    // Validate parameters.
    const vlds = [
        [
            vldRawMongoId(args.userId),
            ()=>({
                kind: "INVALID",
                invalidFieldName: "user id",
            }),
        ],
        [
            args.majors.map((major: any)=>vldRawMongoId(major)),
            ()=>({
                kind: "INVALID",
                invalidFieldName: "majors",
            }),
        ],
        [
            vldYear(args.admissionYear),
            ()=>({
                kind: "INVALID",
                invalidFieldName: "admission year",
            }),
        ],
    ];
    const failedVlds = vlds.filter(([vld, errFac])=>{
        const vldIsPassed = (maybeVlds: any)=>Array.isArray(maybeVlds) ? vld.filter((oneVld: any)=>!oneVld.isPassed).length == 0 : maybeVlds.isPassed;
        return !vldIsPassed(vld);
    });
    if ( failedVlds.length != 0 )
    {
        throw (failedVlds[0] as any)[1]();
    }

    // Authorize.
    const td = c.contextualTokenData.tokenData;
    switch ( td.kind )
    {
        case ContextualTokenDataKind.Admin: break;
        case ContextualTokenDataKind.User:
            if ( (td as UserContextualTokenData).userId.toString() == args.userId )
            {
                break;
            }
            else
                throw {kind: "UNAUTHORIZED"};
        default: throw {kind: "UNAUTHORIZED"};
    }

    // Check improper majors.
    // Get all majors.
    const majorIds = args.majors;
    const majors = await c.mongo.collec(CollectionKind.Association)
        .find({"_id": {$in: majorIds}})
        .project({_id: 0, level: 1})
        .toArray();

    // Check whether their level is all 4.
    const nonLv4Majors = majors.filter((major: any)=>major.level != 4);
    if ( nonLv4Majors.length != 0 )
    {
        throw {kind: "IMPROPER", improperFieldName: "majors"};
    }

    // Add student verification form.
    const newSvId = new mongo.ObjectId();

    // Upload evidences first.
    const evidIds = await Promise.all(args.evidences.map(async (oneEvi: any)=>{
        // Make GraphqlUpload object.
        const guEvi = toGraphqlUpload(oneEvi);

        // Do Upload.
        const [key] = await uploadFile(
            c,
            guEvi.mime,
            {
                kind: FileUserKind.StudentVerificationEvidence,
                studentVerificationId: newSvId,
            } as FileUsedByStudentVerification,
            true,
            guEvi.createReadStream(),
        );

        // Return id.
        return key;
    }));

    const now = new Date(Date.now());
    const userId = new mongo.ObjectId(args.userId);
    const svObj = {
        _id: newSvId,
        issuedDate: now,
        user: userId,
        majors: args.majors,
        evidences: evidIds,
        state: StudentVerificationState.Pending,
        fixedDate: undefined,
    } as StudentVerification;
    c.mongo.collec(CollectionKind.StudentVerification).insertOne(svObj);

    return {id: newSvId.toString()};
}

export async function confirmStudentVerification(c: Context2, args: any)
{
    // Validate parameters.
    const vlds = [
        [
            vldRawMongoId(args.studentVerificationId),
            ()=>({
                kind: "INVALID",
                invalidFieldName: "student verification id",
            }),
        ]
    ];
    const failedVlds = vlds.filter(([vld, errFac]: any)=>!vld.isPassed);
    if ( failedVlds.length != 0 )
    {
        throw (failedVlds[0] as any)[1]();
    }

    // Authorize.
    const td = c.contextualTokenData.tokenData;
    switch ( td.kind )
    {
        case ContextualTokenDataKind.Admin: break;
        case ContextualTokenDataKind.User:
            if ( (td as UserContextualTokenData).userId.toString() == args.userId )
            {
                break;
            }
            else
                throw {kind: "UNAUTHORIZED"};
        default: throw {kind: "UNAUTHORIZED"};
    }

    // Modify student verification form.
    const svId = new mongo.ObjectId(args.studentVerificationId);
    const now = new Date(Date.now());
    await c.mongo.collec(CollectionKind.StudentVerification).updateOne(
        {_id: svId},
        {$set: {state: StudentVerificationState.Verified, fixedDate: now}},
    );

    // Set it as the primary.
    // Get the user id first.
    const {user: userId} = await c.mongo.collec(CollectionKind.StudentVerification).findOne(
        {_id: svId},
        {_id: 0, user: 1},
    );

    // Finally, set the primary verif.
    await c.mongo.collec(CollectionKind.User).updateOne(
        {_id: userId},
        {$set: {primaryStudentVerification: svId}},
    );
}

export async function rejectStudentVerification(c: Context2, args: any)
{
    // Validate parameters.
    const vlds = [
        [
            vldRawMongoId(args.studentVerificationId),
            ()=>({
                kind: "INVALID",
                invalidFieldName: "student verification id",
            }),
        ]
    ];
    const failedVlds = vlds.filter(([vld, errFac]: any)=>!vld.isPassed);
    if ( failedVlds.length != 0 )
    {
        throw (failedVlds[0] as any)[1]();
    }

    // Authorize.
    const td = c.contextualTokenData.tokenData;
    switch ( td.kind )
    {
        case ContextualTokenDataKind.Admin: break;
        case ContextualTokenDataKind.User:
            if ( (td as UserContextualTokenData).userId.toString() == args.userId )
            {
                break;
            }
            else
                throw {kind: "UNAUTHORIZED"};
        default: throw {kind: "UNAUTHORIZED"};
    }

    // Modify student verification form.
    const now = new Date(Date.now());
    const svId = new mongo.ObjectId(args.studentVerificationId);
    await c.mongo.collec(CollectionKind.StudentVerification).updateOne(
        {_id: svId},
        {$set: {state: StudentVerificationState.Rejected, fixedDate: now}},
    );
}

export async function studentVerificationsOfUser(c: Context2, args: any): Promise<{id: string}>
{
    // Validate parameters.
    const vlds = [
        [
            vldRawMongoId(args.userId),
            ()=>({
                kind: "INVALID",
                invalidFieldName: "user id",
            }),
        ]
    ];
    const failedVlds = vlds.filter(([vld, errFac]: any)=>!vld.isPassed);
    if ( failedVlds.length != 0 )
    {
        throw (failedVlds[0] as any)[1]();
    }

    // Get id list.
    const userId = new mongo.ObjectId(args.userId);
    const svIds = await c.mongo.collec(CollectionKind.StudentVerification)
        .find({user: userId})
        .project({_id: 1})
        .toArray();

    // Get, and just return.
    return svIds.map((svId: mongo.ObjectId)=>({id: svId.toString()}));
}
