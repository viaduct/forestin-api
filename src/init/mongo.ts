import mongo from "mongodb";

export interface MongoOptions
{
    url: string;
    dbName: string;
}

export interface Mongo
{
    db: any;
}

export async function init(options: MongoOptions): Promise<Mongo>
{
    const mongoUrl = options.url;
    const mongoClient = await mongo.MongoClient.connect(
        mongoUrl,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    );
    const mongoDbName = options.dbName;
    const mongoDb = mongoClient.db(mongoDbName);

    return{db: mongoDb};
}
