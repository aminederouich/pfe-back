const fs = require('fs');
const path = require('path');

const HTTP_STATUS_REPLACEMENTS = {
  'status(200)': 'status(HTTP_STATUS.OK)',
  'status(201)': 'status(HTTP_STATUS.CREATED)',
  'status(400)': 'status(HTTP_STATUS.BAD_REQUEST)',
  'status(401)': 'status(HTTP_STATUS.UNAUTHORIZED)',
  'status(404)': 'status(HTTP_STATUS.NOT_FOUND)',
  'status(422)': 'status(HTTP_STATUS.UNPROCESSABLE_ENTITY)',
  'status(429)': 'status(HTTP_STATUS.TOO_MANY_REQUESTS)',
  'status(500)': 'status(HTTP_STATUS.INTERNAL_SERVER_ERROR)',
};

const IMPORT_LINE = 'const HTTP_STATUS = require(\'../constants/httpStatus\');';

function addHttpStatusImport(content) {
  const lines = content.split('\n');
  const lastRequireIndex = lines.findLastIndex(line => line.includes('require('));

  if (lastRequireIndex !== -1 && !content.includes('require(\'../constants/httpStatus\')')) {
    lines.splice(lastRequireIndex + 1, 0, IMPORT_LINE);
    return lines.join('\n');
  }
  return content;
}

function replaceHttpStatusCodes(content) {
  let updatedContent = content;

  Object.entries(HTTP_STATUS_REPLACEMENTS).forEach(([search, replace]) => {
    updatedContent = updatedContent.replace(new RegExp(search.replace(/[()]/g, '\\$&'), 'g'), replace);
  });

  return updatedContent;
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if needed
  content = addHttpStatusImport(content);

  // Replace status codes
  content = replaceHttpStatusCodes(content);

  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated: ${filePath}`);
}

// Files to process
const filesToProcess = [
  'controllers/project.controller.js',
  'controllers/user.js',
  'controllers/ticket.js',
  'middleware/auth.js',
];

filesToProcess.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.log(`❌ File not found: ${fullPath}`);
  }
});

console.log('🎉 All files processed!');
