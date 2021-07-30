interface Database {
    type: 'mysql'|'redis',
    host: string,
    port: number,
    username?: string,
    password?: string,
    database?: string,
    logging?: boolean,
}

abstract class Config {
    database: {
        [propName: string]: Database;
    };
    env: string = 'dev';
    custom?: {
        [propName: string]: any;
    };

    async init(): Promise<void> {};
}

export default Config;
