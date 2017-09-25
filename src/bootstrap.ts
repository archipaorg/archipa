'use strict';

import * as Path from 'path';

const pkg = require('../package.json');

import * as readdir from 'recursive-readdir';

export module Bootstrap {

    export const _cli: any = new Map<string, any>();
    export const _api: any = new Map<string, any>();
    export const version = pkg.version;
    export let loaded: boolean = false;
    export let config: any;


    export function commands(): Map<string, any> {
        if (loaded === false) {
            throw new Error('run bootstrap.load before');
        }
        return _api;
    }

    /**
     * returns all the available commands (loaded commands)
     * @returns {Map<string, any>}
     */
    export function cli(): Map<string, any> {
        if (loaded === false) {
            throw new Error('run bootstrap.load before');
        }
        return _cli;
    }

    /**
     * Load all the available orchestrators
     * @param opts
     * @returns {Promise<any>}
     */
    export function load(opts?: any) {
        return new Promise((resolve: any) => {

            Bootstrap.config = { // save all the args passed to the current command
                get: (key: string) => {
                    return opts[key];
                }
            };
            // load the available orchestrators from /orchestrators directory
            readdir(__dirname + '/orchestrators', ((err: any, files: Array<string>) => {
                files.forEach(((file: string) => {

                    if (!/\.js$/.test(file) || file === 'bootstrap.js') {
                        return;
                    }

                    const match = file.match(/(.*)\.js$/);

                    if (match) {
                        const cmd = Path.basename(match[1]);
                        const mod = require(file);
                        if (mod) {
                            for (let key in mod) {
                                if (typeof mod[key] === 'object') {
                                    let controller = mod[key];
                                    if (controller.cli) {
                                        Bootstrap._cli.set(cmd, controller.cli);
                                    }
                                    if (controller.api) {
                                        Bootstrap._api.set(cmd, controller.api);
                                    }
                                }
                            }
                        }
                    }
                }));
                Bootstrap.loaded = true;
                resolve(Bootstrap);
            }));
        });
    }

}
