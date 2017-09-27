import * as Path from 'path';
import * as fs from 'fs';
import {ICLCompiler} from '@archipa/icl/dist/compiler/iclCompiler';
import {using} from '@archipa/icl/dist/core/types/common';
import {FsResource} from '@archipa/icl/dist/compiler/resource/fsResource';
import {FsWatcher} from '@archipa/icl/dist/compiler/resource/fsWatcher';
import {ResourceManager} from '@archipa/icl/dist/compiler/resource/resourceManager';
import {ConfigurationFile} from '@archipa/icl/dist/core/ast/configurationFile';
import {SettingsBlockDeclaration} from '@archipa/icl/dist/core/ast/declaration/settings/settingsBlockDeclaration';
import {Bootstrap} from '../../bootstrap';

import * as Rimraf from  'rimraf';
import * as Yaml from 'js-yaml';
//import * as JsonCircular from 'circular-json';
const JsonCircular = require('circular-json');
const download_git_repo = require('download-git-repo');

/**
 * Kubernetes Controller
 * @description take an icl file as input and compiles it to an appropriate yaml based on the kubernetes version provided
 * @author Mahieddine CHERIF
 * @extends Controller
 */
export module Kubernetes {

    const USAGE = 'Usage: archipa kubernetes <path> [--view-ast, --imports = url1,url2, --searchIn = dir1, dir2...]';

    /**
     * default icl configuration file name extension
     * @const {string}
     */
    const DEFAULT_SETTINGS_FILENAME_EXT: string = '.icl';

    export enum ExportFormat {
        JSON,
        YAML
    }

    /**
     * kubernetes json schema repos
     * @type {string}
     const GITHUB_KUBE_JSON_SCHEMA = 'https://raw.githubusercontent.com/garethr/kubernetes-json-schema/master/%s-standalone/%s.json';*/

    /**
     * latest k8s icl files
     * @type {string}
     * // TODO put the real k8s template repo url
     */
    const K8S_ICL_TEMPLATES_REPO = 'archipaorg/k8s-icl';

    /**
     * k8s lib folder
     * @type {string}
     */
    const K8S_TPL_FOLDER = Path.join('github.com', 'k8s-icl');

    /**
     * default icl compiler
     * @type {ICLCompiler}
     */
    const parser = new ICLCompiler();

    /**
     *
     * @param {string} url
     * @returns {Promise<any>}
     */
    export function cli(url: string) {
        return new Promise((resolve: any, reject: any) => {
            // check params validity
            let output = Bootstrap.config.get('json') ? ExportFormat.JSON : ExportFormat.YAML;
            // check url
            if (!fs.existsSync(url)) {
                const err: any = new Error('The file path that you specified "' + url + '" doesn\'t exists, \r\n' + USAGE);
                err.type = 'EUSAGE';
                return reject(err);
            }

            // check imports
            let imports = Bootstrap.config.get('imports') ? Bootstrap.config.get('imports').split(',') : [];
            // check searchIn folders
            let searchIn = Bootstrap.config.get('searchIn') ? Bootstrap.config.get('searchIn').split(',') : [];

            api(url, imports, searchIn).then((compilationOutput: {
                ast: Array<ConfigurationFile>;
                aliases: {
                    [key: string]: SettingsBlockDeclaration;
                };
                compiled: Object;
            }) => {
                if (compilationOutput) {
                    let obj = Bootstrap.config.get('view-ast') ? compilationOutput.ast : compilationOutput.compiled;
                    if (output == ExportFormat.JSON) {
                        console.log(JsonCircular.stringify(obj));
                    } else {
                        console.log(Yaml.dump(obj));
                    }
                }
                resolve(compilationOutput);
            }).catch(reject);

        });
    }

    /**
     * Compiles the icl file {@param url} using kubernetes
     * @param {string} url
     * @param {Array<string>} imports
     * @param {Array<string>} searchIn
     * @returns {Promise<any>}
     */
    export function api(url: string, imports: Array<string> = [], searchIn: Array<string> = []) {
        return new Promise((resolve: any, reject: any) => {
            using(new ResourceManager(), (resourceManager) => {
                using(new FsWatcher(), (watcher) => {
                    let mainResource = new FsResource<string, ConfigurationFile>(url, undefined, searchIn);
                    mainResource.setCacheManager(resourceManager);
                    mainResource.setWatcher(watcher);
                    compile(mainResource, imports.map((element: string) => {
                        let resource = new FsResource<string, ConfigurationFile>(element, undefined, searchIn);
                        resource.setCacheManager(resourceManager);
                        resource.setWatcher(watcher);
                        return resource;
                    }), searchIn).then((compilationOutput) => {
                        resolve(compilationOutput);
                    }).catch(reject);
                });
            });
        });
    }

    /**
     * Parse the provided file
     * @param {FsResource<string, ConfigurationFile>} resource
     * @param {Array<FsResource<string, ConfigurationFile>>} inject
     * @param {Array<string>} searchIn
     * @returns {Promise<{ast: Array<ConfigurationFile>; aliases: {[p: string]: SettingsBlockDeclaration}; compiled: Object}>}
     */
    function compile(resource: FsResource<string, ConfigurationFile>, inject?: Array<FsResource<string, ConfigurationFile>>, searchIn?: Array<string>): Promise<{
        ast: Array<ConfigurationFile>;
        aliases: {
            [key: string]: SettingsBlockDeclaration;
        };
        compiled: Object;
    }> {

        // dl kubernetes libraries
        const repoPath = Path.join(Path.dirname(resource.uri), K8S_TPL_FOLDER);

        return new Promise((resolve: any, reject: any) => {
            dlRepo(K8S_ICL_TEMPLATES_REPO, repoPath).then(() => {
                // Access any repository methods here.
                const compilationOutput = parser.compile(resource, inject);
                // remove repo
                Rimraf.sync(Path.resolve(repoPath));
                resolve(compilationOutput);
            }).catch((e) => {
                Rimraf.sync(Path.resolve(repoPath));
                // remove repo
                reject(e);
            });
        });
    }

    /**
     * Download github repository
     * @param {string} url
     * @param {string} target
     * @returns {Promise<any>}
     */
    function dlRepo(url: string, target: string) {
        return new Promise((resolve: any, reject: any) => {
            download_git_repo(url, target, {}, (err: any) => {
                if (err) {
                    if (err.statusCode && err.statusCode == 404) {
                        let err: any = new Error('Can\'t find the included library "' + url + '"');
                        err.type = 'EUSAGE';
                        reject(err);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve();
                }
            });
        });
    }

}
