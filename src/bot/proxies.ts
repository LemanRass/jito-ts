import { HttpsProxyAgent } from 'https-proxy-agent';

class Proxy {
  host: string;
  port: number;
  auth: {
    username: string;
    password: string;
  };

  constructor(host: string, port: number, username: string, password: string) {
    this.host = host;
    this.port = port;
    this.auth = {
      username,
      password
    };
  }

  toString() : string {
    return `${this.host}:${this.port}`;
  }

  getAgent() {
    const auth : string = `${this.auth.username}:${this.auth.password}`
    return new HttpsProxyAgent(`http://${auth}@${this.toString()}`);
  }
}

const proxies : Proxy[] = [
  new Proxy('51.89.14.144', 2831, '46122', 'YIIwl1hI'),
  new Proxy('135.125.173.86', 2831, '46122', 'YIIwl1hI'),
  new Proxy('51.195.124.203', 2831, '46122', 'YIIwl1hI'),
  new Proxy('135.125.224.132', 2831, '46122', 'YIIwl1hI'),
  new Proxy('51.89.89.98', 2831, '46122', 'YIIwl1hI'),
  new Proxy('135.125.192.96', 2831, '46122', 'YIIwl1hI'),
  new Proxy('51.195.72.153', 2831, '46122', 'YIIwl1hI'),
  new Proxy('135.125.166.254', 2831, '46122', 'YIIwl1hI'),
  new Proxy('51.68.185.139', 2831, '46122', 'YIIwl1hI'),
  new Proxy('135.125.215.220', 2831, '46122', 'YIIwl1hI'),
  new Proxy('135.125.210.184', 2831, '46122', 'YIIwl1hI'),
  new Proxy('135.125.166.195', 2831, '46122', 'YIIwl1hI'),
  new Proxy('51.77.70.233', 2831, '46122', 'YIIwl1hI')
];
let currentProxy = 0;

export function getProxy() {
  const proxy = proxies[currentProxy];
  currentProxy = (currentProxy + 1) % proxies.length;
  return proxy;
}
