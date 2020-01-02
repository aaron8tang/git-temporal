import { safelyParseInt } from '@git-temporal/commons';
import { log } from '@git-temporal/logger';
import {
  getCommitHistory,
  getCommitRange,
} from '@git-temporal/git-log-scraper';

import { timeThis } from '../common/timeThis';

export function serveHistory(req, res) {
  const requestPath = req.query.path || '.';
  const skip = safelyParseInt(req.query.skip);
  const maxCount = safelyParseInt(req.query.maxCount);

  log(`getting git log for ${requestPath} ${skip} ${maxCount}`);
  const { time, result } = timeThis(getCommitHistory, requestPath, {
    skip,
    maxCount,
  });
  log(
    `retrieved ${result.commits.length} commits for ${
      req.query.path
    } in ${time}ms`
  );
  res.send(result);
}

export function serveCommitRange(req, res) {
  const requestPath = req.query.path || '.';

  log(`getting commitRange for ${requestPath}`);
  const { time, result } = timeThis(getCommitRange, requestPath);
  log(
    `${result.count} commits
     from ${result.firstCommit.authorDate}
     to ${result.lastCommit.authorDate}
     in ${time}ms`
  );
  res.send(result);
}
