export interface AwsS3ObjectGetOptions
{
    s3: any;
    expressApp: any;
    sendErrorToClient: boolean;
}

export interface AwsS3ObjectGet
{}

export async function init(options: AwsS3ObjectGetOptions): Promise<AwsS3ObjectGet>
{
    console.log("Initializing the module aws-s3-object-get...");

    const {s3, expressApp: app} = options;

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
                if (options.sendErrorToClient) {
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
