import Context from './context';

class Task {
    params_schema?: {
        [propName: string]: string;
    }
    async init(ctx: Context): Promise<void> {};
    async start(ctx: Context): Promise<void> {};
    error(msg: string): void {
        throw msg;
    }

    constructor() {
    }
}

export default Task;
