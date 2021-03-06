import dotenv from "dotenv";

export interface DotenvOptions{}
export interface DotenvResult{}

export async function init(options: DotenvOptions): Promise<DotenvResult>
{
    console.log("Initializing the module dotenv...");

    dotenv.config();

    return {};
}
