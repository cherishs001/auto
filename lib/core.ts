import Load from './load';
import * as path from 'path';
import {Orm, Connection} from '@kaishen/orm';
import Context from './context';
import {Decimal} from 'decimal.js';
import * as moment from 'moment';

class Core {
    private _config: any;
    private _env: string;
    private _params: Array<string>;
    private _fund_id: string;
    private _date: string;
    private _method: string;
    private tasks: any = {};
    private _db: { [propsName: string]: Connection };

    init(): Promise<void> {
        const args = JSON.parse(process.env.data || '{}');
        // 初始化参数
        this._env = args['env'] || 'dev';
        const fund_id: string = args['fund_id'] || '66666';
        const date: string = args['date'] || moment().format('YYYY-MM-DD');
        const task_id = args['id'] || '99999';
        const params_str = args['params'];
        const params_split = params_str.split(' ');
        const params = [];
        for (let i = 1; i < params_split.length; i++) {
            params.push(params_split[i]);
        }
        const method = params_split[0];
        this._params = params;
        this._fund_id = fund_id;
        this._date = date;
        this._method = method;

        return new Promise<void>(async (resolve, reject) => {
            try {
                const config = Load.init(path.join(process.cwd(), './config'));
                const configs = {};
                for (const item of config) {
                    if (item['name'] === this._env) {
                        const c = new item['func'];
                        await c.init();
                        configs[item['name']] = c;
                    }
                }
                this._config = configs[this._env];

                // this._db = {};

                // 注入数据库
                this._db = {};
                for (const key in this._config['database']) {
                    if (this._config['database'].hasOwnProperty(key)) {
                        // await seq.authenticate()
                        const tmp = new Orm(
                            this._config['database'][key].host,
                            this._config['database'][key].port,
                            this._config['database'][key].username,
                            this._config['database'][key].password,
                            this._config['database'][key].database,
                            {
                                max: 1,
                                min: 1,
                            },
                        );
                        this._db[key] = tmp.authenticate(key);
                    }
                }

                const tasks = Load.init(path.join(process.cwd(), './tasks'));
                for (const item of tasks) {
                    if (item['func']) {
                        const task = new item['func'];
                        this.tasks[task.method || `${item['name']}`] = task;
                    }
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        })
    }

    async start(): Promise<void> {
        const ctx = new Context(this._fund_id, this._date);
        ctx.database = this._db;
        try {
            ctx.env = this._env;
            ctx.custom_config = this._config['custom'] || {};
            // 初始化params
            let index = 0;
            ctx.params = {};
            if (this.tasks[this._method].params_schema) {
                for (const key in this.tasks[this._method].params_schema) {
                    if (!this._params[index]) {
                        ctx.params[`${key}`] = '';
                        continue;
                    }
                    if (this.tasks[this._method].params_schema[key] === 'string') {
                        ctx.params[`${key}`] = this._params[index].toString();
                    }
                    if (this.tasks[this._method].params_schema[key] === 'number') {
                        ctx.params[`${key}`] = new Decimal(this._params[index]).toNumber();
                    }
                    if (this.tasks[this._method].params_schema[key] === 'bool') {
                        if (this._params[index]) {
                            if (this._params[index] === 'true') {
                                ctx.params[`${key}`] = true;
                            } else {
                                ctx.params[`${key}`] = false;
                            }
                        } else {
                            ctx.params[`${key}`] = false;
                        }
                    }
                    index++;
                }
            }
            await this.tasks[this._method].init(ctx);
            await this.tasks[this._method].start(ctx);
        } catch (e) {
            console.log(e);
        }
    }

    async run(task_name: string, params: Array<string>, ctx: Context): Promise<void> {
        try {
            // 初始化params
            let index = 0;
            ctx.params = {};
            if (this.tasks[task_name].params_schema) {
                for (const key in this.tasks[task_name].params_schema) {
                    if (!params[index]) {
                        ctx.params[`${key}`] = '';
                        continue;
                    }
                    if (this.tasks[task_name].params_schema[key] === 'string') {
                        ctx.params[`${key}`] = params[index].toString();
                    }
                    if (this.tasks[task_name].params_schema[key] === 'number') {
                        ctx.params[`${key}`] = new Decimal(params[index]).toNumber();
                    }
                    if (this.tasks[task_name].params_schema[key] === 'bool') {
                        if (params[index]) {
                            if (params[index] === 'true') {
                                ctx.params[`${key}`] = true;
                            } else {
                                ctx.params[`${key}`] = false;
                            }
                        } else {
                            ctx.params[`${key}`] = false;
                        }
                    }
                    index++;
                }
            }
            await this.tasks[task_name].init(ctx);
            await this.tasks[task_name].start(ctx);
        } catch (e) {
            console.log(e);
        }
    }
}

export default Core;
