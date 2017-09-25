import * as Mkdirp from 'mkdirp';
import * as Rimraf from 'rimraf';
import * as Glob from 'glob';
import * as Path from 'path';
import * as Fs from 'fs';
import {spawnSync} from 'child_process';

const Log = require('npmlog');

/**
 * DocBuilder generates man pages from markdown documentation
 */
export class DocBuilder {

    private static readonly templateFile = Path.join(__dirname, '/../doc/website/template.html');

    public static readonly sources: any = {
        api: DocBuilder.getSources('api'),
        cli: DocBuilder.getSources('cli'),
        websiteIndex: DocBuilder.getSources('spec'),
    };

    /**
     * returns all markdown files
     * @param {string} type
     * @returns {string[]}
     */
    public static getSources(type: string) {
        const files: Array<string> = Glob.sync(Path.join('doc/', type, '/*.md'));
        return files.map(file => Path.resolve(file));
    }

    public static cleanUpMan() {
        Rimraf.sync(Path.join(__dirname, '/man/'));
        // recreate the target directory
        Mkdirp.sync(Path.join(__dirname, '/man/'));
    }

    public static cleanUpWebsite() {
        Rimraf.sync(Path.join(__dirname, '/spec/'));
        Mkdirp.sync(Path.join(__dirname, '/spec/'));
    }

    public static getTargetForManpages(currentFile: string, type: string) {
        let target: string = '';
        // set the right section for the man page on unix systems
        if (type === 'cli') {
            target = currentFile.replace(/\.md$/, '.1');
        }
        if (type === 'api') {
            target = currentFile.replace(/\.md$/, '.3');
        }
        // replace the source dir with the target dir
        // do it for the windows path (doc\\api) and the unix path (doc/api)
        target = target
            .replace(['doc', 'cli'].join(Path.sep), 'man')
            .replace(['doc', 'api'].join(Path.sep), 'man');
        return target;
    }

    public static getTargetForWebsite(currentFile: string, type: string) {
        let target = currentFile;
        // modifiy the filename a bit for our html file:
        // prefix all cli functions with cli- instead of archipa-
        // prefix all api functions with api- instead of archipa
        if (type === 'cli') {
            target = currentFile.replace(/archipa-/, 'cli-');
        }
        if (type === 'api') {
            target = currentFile.replace(/archipa-/, 'api-');
        }
        // set the file ending to html
        target = target.replace(/\.md$/, '.html');
        // replace the source dir with the target dir
        target = target
            .replace(['doc', 'cli'].join(Path.sep), 'doc/website')
            .replace(['doc', 'api'].join(Path.sep), 'doc/website')
            .replace(['doc', 'spec'].join(Path.sep), '/doc/website');
        return target;
    }

    public static getTocForWebsite() {
        let toc = '<ul>';
        Object.keys(DocBuilder.sources).forEach(type => {
            // we don't want the index in our toc for now
            if (type === 'websiteIndex') {
                return;
            }
            toc += `<li><span>${type}</span><ul>`;
            DocBuilder.sources[type].forEach((currentFile: string) => {
                const prefix = type === 'cli' ? 'cli-' : 'api-';
                const file = Path.basename(currentFile)
                    .replace('archipa-', prefix).replace(/\.md/, '.html');
                const linktext = Path.basename(currentFile)
                    .replace('archipa-', '')
                    .replace(/\.md/, '');
                toc += `<li><a href="${file}">${linktext}</a></li>`;
            });
            toc += '</ul></li>';
        });
        toc += '</ul>';
        return toc;
    }

    public static buildMan() {
        DocBuilder.cleanUpMan();
        Log.notice('start man generation');
        Object.keys(DocBuilder.sources).forEach((type: string) => {
            DocBuilder.sources[type].forEach((currentFile: string) => {
                if (type === 'websiteIndex') {
                    return;
                }
                // convert markdown to man-pages
                const out = spawnSync('node', [
                    './node_modules/marked-man/bin/marked-man',
                    currentFile
                ]);
                const target = DocBuilder.getTargetForManpages(currentFile, type);
                // write output to target file
                Fs.writeFileSync(target, out.stdout, 'utf8');
                Log.notice(currentFile + ' processed');
            })
        });
        Log.notice('man pages generation completed');
    }

    public static buildWebsite() {
        DocBuilder.cleanUpWebsite();
        Log.notice('start spec generation');
        const template = Fs.readFileSync(DocBuilder.templateFile, 'utf8');
        const toc = DocBuilder.getTocForWebsite();

        Object.keys(DocBuilder.sources).forEach(type => {
            console.log(type);
            DocBuilder.sources[type].forEach((currentFile: string) => {
                console.log(currentFile);
                // convert markdown to spec content
                const out = spawnSync('node', [
                    './node_modules/marked/bin/marked',
                    currentFile
                ]);
                const target = DocBuilder.getTargetForWebsite(currentFile, type);
                const rendered = template
                    .replace('__CONTENT__', out.stdout)
                    .replace('__TOC__', toc);
                // write output to target file
                Fs.writeFileSync(target, rendered, 'utf8');
            });
        });
    }
}

DocBuilder.buildMan();
DocBuilder.buildWebsite();