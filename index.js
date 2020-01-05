'use strict';

process.env.NODE_CONFIG_DIR = `${__dirname}/config/`;
const config = require('config');
const fs = require('fs').promises;
const { version, cwd } = require('process');
const { parse, format } = require('path');
const xml = require('xml');

(async function main() {
  try {
    const currentDir = cwd();
    const { base: tag } = parse(currentDir);
    const listing = await fs.readdir(currentDir, { withFileTypes: true });
    listing
      .filter(file => file.isFile() && !file.name.startsWith('.') && config.get('files_ext').includes(parse(file.name).ext.substring(1)))
      .forEach((file) => {
        const filename = parse(file.name);
        const newFilename = format({
          root: filename.root,
          name: filename.name,
          ext: '.nfo',
        });
        const nfoFileContent = xml({
          musicvideo: [
            { title: filename.name },
            { tag },
          ],
        }, '  ');
        fs.writeFile(newFilename, nfoFileContent);
      });
  } catch (e) {
    console.error({ message: e.message, stack: e.stack }, `Version: ${version}`);
  }
}());
