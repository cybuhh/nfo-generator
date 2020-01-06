'use strict';

process.env.NODE_CONFIG_DIR = `${__dirname}/config/`;
const config = require('config');
const fs = require('fs').promises;
const { version, cwd } = require('process');
const { parse, format } = require('path');
const xml = require('xml');

/**
 *
 * @param {fs.Dirent} file
 * @param {String} tag
 *
 * @return {Null}
 */
function generateNfoFile(file, tag) {
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
  return fs.writeFile(newFilename, nfoFileContent);
}

(async function main() {
  try {
    const currentDir = cwd();
    const { base: tag } = parse(currentDir);
    const listing = await fs.readdir(currentDir, { withFileTypes: true });
    await Promise.all(listing
      .filter(file => file.isFile() && !file.name.startsWith('.') && config.get('files_ext').includes(parse(file.name).ext.substring(1)))
      .map(file => generateNfoFile(file, tag)));
  } catch (e) {
    console.error({ message: e.message, stack: e.stack }, `Version: ${version}`);
  }
}());
