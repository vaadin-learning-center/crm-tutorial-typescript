// TODO: publish to npm
function litCssLoader(source) {
  // copied from https://github.com/webpack-contrib/raw-loader/blob/master/src/index.js
  // and https://github.com/webpack/webpack/issues/903

  const json = JSON.stringify(source)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `
import {unsafeCSS} from 'lit-element';
export default unsafeCSS(${json});
`;
}

module.exports = litCssLoader;
