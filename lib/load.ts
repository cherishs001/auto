import * as fs from 'fs';
import * as path from 'path';


const read_file_list = (dir: string, list: Array<any>): Array<any> => {
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        const full_path = path.join(dir, item);
        const stat = fs.statSync(full_path);
        if (stat.isDirectory()) {
            read_file_list(path.join(dir, item), list);
        } else {
            list.push({
                file: item,
                full_path: full_path,
            });
        }
    })
    return list;
}
/**
 * 动态加载类
 */
class Load {
    static init(dir: string): Array<any> {
        const dynamicModules = [];
        let list = [];
        list = read_file_list(dir, list);
        for (const item of list) {
            if (item.file.match(/\.ts|.js$/) !== null) {
                let name = item.full_path.replace('.ts', '');
                name = name.replace('.js', '');
                let key = item.file.replace('.ts', '');
                key = key.replace('.js', '');
                const module = require(name).default;
                dynamicModules.push({
                    name: key,
                    func: module,
                });
            }
        }
        return dynamicModules;
        // fs.readdirSync(dir).map(file => {
        //     const filePath = path.join(dir, file);
        //     const stats = fs.statSync(filePath);
        //     if (stats.isFile()) {
        //         if (file.match(/\.ts|.js$/) !== null) {
        //             let name = filePath.replace('.ts', '');
        //             name = name.replace('.js', '');
        //             let key = file.replace('.ts', '');
        //             key = key.replace('.js', '');
        //             const module = require(name).default;
        //             dynamicModules.push({
        //                 name: key,
        //                 func: module,
        //             });
        //         }
        //     }
        // });
        // return dynamicModules;
    }
}

export default Load;
