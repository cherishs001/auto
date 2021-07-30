import * as http from 'http';
import * as https from 'https';

interface Config {
    url: string
    host?: string
    domain: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    json?: boolean
    data?: object,
    protocol?: 'http' | 'https',
    header?: object,
}

const params = (data) => {
    const arr = [];
    for (const i in data) {
        if (data.hasOwnProperty(i)) {
            if (data[i] instanceof Array) {
                data[i] = JSON.stringify(data[i]);
            }
            arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
        }
    }
    return arr.join('&');
};

const Fetch = (config: Config): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        const protocol = config.protocol || 'http';
        const agent = protocol === 'http' ? http : https;
        if (config.method === 'POST') {
            const data = JSON.stringify(config.data);
            const options = {
                headers: {
                    'content-type': 'application/json',
                    ...config.header,
                },
                method: config.method,
            };
            if (config.host) {
                options['host'] = config.host;
                options['path'] = config.url;
                options['headers']['host'] = config.domain;
            } else {
                options['hostname'] = config.domain;
                options['path'] = config.url;
            }
            const req = agent.request(options, (res) => {
                res.setEncoding('utf8');
                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                })
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        if (config.json) {
                            resolve(JSON.parse(body));
                        } else {
                            resolve(body);
                        }
                    } else {
                        reject({
                            code: res.statusCode,
                            body: body,
                        })
                    }
                })
            });
            req.write(data + '\n');
            req.on('error', (err) => {
                reject(err);
            });
            req.end();
        }
        if (config.method === 'GET') {
            const data = params(config.data);
            const options = {
                headers: {
                    ...config.header,
                },
            };
            if (config.host) {
                options['host'] = config.host;
                options['path'] = config.url + (config.url.indexOf('?') === -1 ? '?' + data : '&' + data);
                options['headers']['host'] = config.domain;
            } else {
                options['hostname'] = config.domain;
                options['path'] = config.url + (config.url.indexOf('?') === -1 ? '?' + data : '&' + data);
            }
            const req = agent.get(options, (res) => {
                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        if (config.json) {
                            resolve(JSON.parse(body));
                        } else {
                            resolve(body);
                        }
                    } else {
                        reject({
                            code: res.statusCode,
                            body: body,
                        })
                    }
                });
            });
            req.on('error', (err) => {
                reject(err);
            });
        }
    })
}

export default Fetch;
