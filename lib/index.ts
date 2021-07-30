import Core from './core';
import {Orm, Database, getConnection} from '@kaishen/orm';
import Config from './config';
import Task from './Task';
import Context from './context';
import {Decimal} from 'decimal.js';
import * as moment from 'moment';
import Fetch from './fetch';

class TaskFlow extends Core {
    static app: TaskFlow = new TaskFlow();

    private constructor() {
        super();
    }
}

export {
    TaskFlow,
    Orm,
    Config,
    Task,
    Context,
    Decimal,
    moment,
    Fetch,
    Database,
    getConnection,
};
