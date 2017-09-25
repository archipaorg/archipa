#!/usr/bin/env node
///<reference path='../typings/npmlog.d.ts'/>
import * as Nopt from 'nopt';
import {Bootstrap} from './bootstrap';

const Log = require('npmlog');
const pkg = require('../package.json');

const parsed = Nopt({
    'json': [Boolean],
    'yaml': [Boolean]
}, {'j': '--json', 'y': '--yaml'}, process.argv, 2);


const cmd = parsed.argv.remain.shift();

function errorHandler(err: any) {
    if (!err) {
        process.exit(1);
    }
    if (err.type === 'EUSAGE') {
        err.message && Log.error(err.message);
        process.exit(1);
    }
    err.message && Log.error(err.message);
    if (err.stack) {
        Log.error('', err.stack);
        Log.error('', '');
        Log.error('', '');
        Log.error('', 'archipa:', pkg.version, 'node:', process.version);
        Log.error('', 'please open an issue including this log on ' +
            pkg.bugs.url);
    }
    process.exit(1);
}

Bootstrap.load(parsed).then(() => {
    if (!Bootstrap.config.get('json') && !Bootstrap.config.get('yaml')) {
        const err: any = new Error('Invalid output format, valid output formats are json, yaml \r\nUsage:archipa <orchestrator> --json|--yaml');
        err.type = 'EUSAGE';
        throw err;
    }
    else if (Bootstrap.cli().has(<string>cmd)) {
        Bootstrap.cli().get(<string>cmd)
            .apply(null, parsed.argv.remain)
            .then(() => {
                process.exit(0);
            })
            .catch(errorHandler);
    } else {
        let msg = '';
        if (!cmd) {
            msg = 'No orchestrator specified';
        } else {
            msg = 'Invalid orchestrator specified "' + (<string>cmd) + '"';
        }
        const err: any = new Error(msg + ' \r\nUsage: archipa <controller> <path> [--json|--yaml]');
        err.type = 'EUSAGE';
        throw err;
    }
}).catch(errorHandler);