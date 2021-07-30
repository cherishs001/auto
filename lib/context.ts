import * as Snow from '@axihe/snowflake';
import {Connection} from '@kaishen/orm';

class Context {
    fund_id: string;
    date: string;
    env: string;
    params: {
        [propName: string]: any;
    };
    custom_config?: {
        [propName: string]: any;
    }
    snow_id: Snow;
    database?: {
        [propName: string]: Connection;
    };

    constructor(fund_id: string, date: string) {
        this.fund_id = fund_id;
        this.date = date;
        this.snow_id = new Snow(0, 0);
    }

    abort(code?: number): void {
        if (code) {
            process.exit(code);
        }
        process.exit(-1);
    }
}

export default Context;
