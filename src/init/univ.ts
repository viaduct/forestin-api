import mongo from "mongodb";

const rawData: any = {
    "A대학교": {
        code: 1,
        "M캠퍼스": {
            code: 2,
            "L대학": {
                code: 3,
                "X학과": {
                    code: 4,
                },
                "Y학과": {
                    code: 5,
                },
            },
            "R대학": {
                code: 6,
                "X학과": {
                    code: 7,
                },
                "Y학과": {
                    code: 8,
                },
            }
        },
        "N캠퍼스": {
            code: 9,
            "L대학": {
                code: 10,
                "X학과": {
                    code: 11,
                },
                "Y학과": {
                    code: 12,
                },
            },
            "R대학": {
                code: 13,
                "X학과": {
                    code: 14,
                },
                "Y학과": {
                    code: 15,
                },
            }
        },
    },
    "B대학교": {
        code: 16,
        only: {
            code: 17,
            "L대학": {
                code: 18,
                "X학과": {
                    code: 19,
                },
                "Y학과": {
                    code: 20,
                },
            },
            "R대학": {
                code: 21,
                "X학과": {
                    code: 22,
                },
                "Y학과": {
                    code: 23,
                },
            }
        },
    },
    "C대학교": {
        code: 24,
        only: {
            code: 25,
            "L대학": {
                code: 26,
                "X학과": {
                    code: 27,
                },
                "Y학과": {
                    code: 28,
                },
            },
            "R대학": {
                code: 29,
                "X학과": {
                    code: 30,
                },
                "Y학과": {
                    code: 31,
                },
            }
        },
    },
};

class Association
{
    constructor(
        public name: string,
        public level: number,
        public parent: string | null,
        public code: string,
        public isOnlyChild: boolean,
    ){}
}

async function init(collection: mongo.Collection)
{
    // WARNING! High hierarchies! But read the comments carefully, there's nothing complex.

    // Make an object into array.
    function bePair(data: any): [string, any][]
    {
        const result: [string, any][] = [];

        for ( const [key, value] of data )
        {
            result.push([key, value]);
        }

        return result;
    }

    // Iterate through universities.
    bePair(rawData).forEach(async ([key, value]: [string, any])=>{
        const level = 1;
        const parent = null;

        await collection
            .insertOne({
                name: key,
                parent: parent,
                level: level,
                code: value.code,
                isOnlyChild: false,
            });
    });
}

export async function universities(): Promise<string[]>
{
    return [];
}

export async function campuses(parent: string): Promise<string[]>
{
    return [];
}

export async function colleges(parent: string): Promise<string[]>
{
    return [];
}

export async function majors(parent: string): Promise<string[]>
{
    return [];
}
