export interface AwsS3ObjectGetOptions
{
    s3: any;
    expressApp: any;
}

export interface AwsS3ObjectGet
{}

export async function init(options: AwsS3ObjectGetOptions): Promise<AwsS3ObjectGet>
{
    const {s3, expressApp: app} = options;

    // Evaluate whether to send error details to the client.
    let doesSendErrorToClient: boolean;
    {
        const sendErrorEnvVar = process.env.ROLLOUT_SEND_ERROR;
        if ( sendErrorEnvVar != null )
        {
            console.assert(typeof(sendErrorEnvVar) == "string");
        }
        let sendErrorState: string; // One of "undefined", "true", "false", "other"
        if ( sendErrorEnvVar == null ) // or, undefined
        {
            sendErrorState = "undefined";
        }
        else if ( sendErrorEnvVar == "true" )
        {
            sendErrorState = "true";
        }
        else if ( sendErrorEnvVar == "false" )
        {
            sendErrorState = "false";
        }
        else
        {
            sendErrorState = "other";
        }
        switch ( sendErrorState )
        {
            case "true":
                doesSendErrorToClient = true;
                break;
            case "false":
            case "undefined":
                doesSendErrorToClient = false;
                break;
            case "other":
                console.error(`Unexpected ROLLOUT_SEND_ERROR value, ${sendErrorEnvVar}. Automatically set this property into "false".`);
                doesSendErrorToClient = false;
                break;
        }
    }

    // Allow that this api can be called from anywhere.
    app.use("/*", (request: any, response: any, next: Function)=>{
        response.set("Access-Control-Allow-Origin", "*");
        // response.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
        // response.set("Access-Control-Allow-Headers", "Content-Type");
        next();
    });
    app.get("/resources/:bucket/:key", async (request: any, response: any)=> {
        // Parse parameters.
        const {bucket, key} = request.params;

        // Prepare s3 bucket GET parameters.
        const s3Request = s3.getObject({
            Bucket: bucket,
            Key: key,
        });

        // When s3 is called
        let s3ReadStream: any;
        s3Request.on("httpHeaders", (status: number, headers: any) => {
            response.set("Content-Type", headers["content-type"]);
            s3ReadStream.pipe(response);
        });

        // Make s3 request. Make stream from it, and pipe to the response.
        s3ReadStream = s3Request.createReadStream()
            .on("error", (err: any) => {
                if (doesSendErrorToClient) {
                    response
                        .set("Content-Type", "application/json")
                        .status(err.statusCode || 500) // If there's no statusCode, return 500.
                        .send(err);
                } else {
                    response
                        .status(500)
                        .end();
                }
            });
    });

    return {};
}
