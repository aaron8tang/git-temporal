import child_process from 'child_process';
import * as fs from 'fs';
import { findGitRoot } from '@git-temporal/commons';
import { log, setPrefix } from '@git-temporal/logger';

setPrefix('git-log-scraper');

const parsedAttributes = {
  id: '%H%n',
  hash: '%h%n',
  authorName: '%an%n',
  authorEmail: '%ae%n',
  relativeDate: '%cr%n',
  authorDate: '%at%n',
  message: '%s%n',
  body: '%b',
};

export function getCommitHistory(fileName) {
  const gitRoot = findGitRoot(fileName);
  if (gitRoot) {
    process.chdir(gitRoot);
  }
  const rawLog = fetchFileHistory(fileName);
  const commits = parseGitLogOutput(rawLog).sort((a, b) => {
    return b.authorDate - a.authorDate;
  });
  const isFile =
    fs.existsSync(fileName) && !fs.lstatSync(fileName).isDirectory();

  return {
    isFile,
    commits,
    path: fileName,
  };
}

// Implementation

function fetchFileHistory(fileName) {
  let format = '';
  for (const attr in parsedAttributes) {
    format += `${attr}:${parsedAttributes[attr]}`;
  }
  const flags = ` --pretty=\"format:${format}\" --topo-order --date=local --numstat --follow`;

  // use -- fileName and git log will work on deleted files and paths
  const cmd = `git log${flags} -- ${escapeForCli(fileName)}`;
  if (process.env.DEBUG === '1') {
    log(`$ ${cmd}`);
  }
  return child_process
    .execSync(cmd, {
      stdio: 'pipe',
    })
    .toString();
}

function safelyParseInt(parseableNumber) {
  if (parseableNumber === null || parseableNumber === undefined) {
    return 0;
  }
  const parsedNumber = parseInt(parseableNumber, 10);
  if (isNaN(parsedNumber)) {
    return 0;
  }

  return parsedNumber;
}

function parseGitLogOutput(output) {
  const logItems = [];
  const logLines = output.split(/\n\r?/);
  let commitIndex = 0;

  let currentlyParsingAttr = null;
  let parsedValue = null;

  let commitObj = null;
  let totalLinesAdded = 0;
  let totalLinesDeleted = 0;
  // let lineNumber = 0;

  const addLogItem = () => {
    if (!commitObj) {
      return;
    }
    commitObj.linesAdded = totalLinesAdded;
    commitObj.linesDeleted = totalLinesDeleted;
    commitObj.index = commitIndex;
    logItems.push(commitObj);

    totalLinesAdded = 0;
    totalLinesDeleted = 0;
    commitIndex += 1;
  };

  for (const line of logLines) {
    // lineNumber += 1;
    let matches = line.match(/^id\:(.*)/);
    if (matches) {
      currentlyParsingAttr = 'id';
      addLogItem();
      commitObj = {
        id: matches[1],
        files: [],
        body: '',
        message: '',
      };
      continue;
    }
    matches = line.match(/^([^\:]+):(.*)/);
    if (matches) {
      let attr;
      [, attr, parsedValue] = matches;
      if (attr === 'authorDate') {
        parsedValue = parseInt(parsedValue, 10);
      }
      if (Object.keys(parsedAttributes).includes(attr)) {
        currentlyParsingAttr = attr;
        commitObj[currentlyParsingAttr] = parsedValue;
        continue;
      }
    }
    if ((matches = line.match(/^([\d\-]+)\s+([\d\-]+)\s+(.*)/))) {
      let [linesAdded, linesDeleted, fileName] = matches.slice(1);
      linesAdded = safelyParseInt(linesAdded);
      linesDeleted = safelyParseInt(linesDeleted);
      fileName = fileName.trim();
      currentlyParsingAttr = 'files';

      totalLinesAdded += linesAdded;
      totalLinesDeleted += linesDeleted;
      commitObj.files.push({
        linesAdded,
        linesDeleted,
        name: fileName,
      });
    } else if (currentlyParsingAttr === 'body') {
      commitObj.body += `<br>${line}`;
    }
  }
  if (commitObj) {
    addLogItem();
  }
  return logItems;
}

/*
    See nodejs path.normalize().  This method extends path.normalize() to add:
    - escape of space characters
*/
function escapeForCli(filepath) {
  if (!filepath || filepath.trim().length === 0) {
    return './';
  }
  return filepath.replace(
    /([\s\(\)\-])/g,
    `${process.platform === 'win32' ? '^' : '\\'}$1`
  );
}
