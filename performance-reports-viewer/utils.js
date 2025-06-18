const fs = require('fs');
const path = require('path');

function getFilesTree(dir) {
  const result = {};
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      result[file] = getFilesTree(filePath);
    } else {
      if (!result.files) result.files = [];
      result.files.push(file);
    }
  });
  return result;
}

module.exports = {
  getFilesTree
};
