// @ts-ignore
import express from 'express';
import { debug, log, setPrefix } from '@git-temporal/logger';

import { serveHistory } from './history';
import { serveDiff } from './diff';
import { findGitRoot } from '@git-temporal/commons';

setPrefix('@git-temporal/api-node-express');

const app = express();
const port = process.env.GT_API_PORT || 11966;
const gitRepoPath = process.env.GT_GIT_REPO_PATH || process.cwd();

const gitRoot = findGitRoot(gitRepoPath);
debug('git root dir: ', gitRoot);
process.chdir(gitRoot);

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/git-temporal/history', serveHistory);
app.get('/git-temporal/diff', serveDiff);

app.listen(port, () => log(`API server listening on port ${port}!`));
