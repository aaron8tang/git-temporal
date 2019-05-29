import { ActionTypes } from 'app/actions/ActionTypes';
import { isVscode, vscode } from 'app/actions/vscode';
import { Dispatch } from 'redux';
import { debug } from '@git-temporal/logger';

export const requestDiff = (path: string) => ({
  selectedPath: path,
  type: ActionTypes.REQUEST_DIFF,
});

export const receiveDiff = (path: string, diff: any) => ({
  diff,
  selectedPath: path,
  type: ActionTypes.RECEIVE_DIFF,
});

export const fetchDiff = (
  path: string,
  leftCommit: string,
  rightCommit: string
) => (dispatch: Dispatch) => {
  dispatch(requestDiff(path));

  if (isVscode) {
    debug('sending diff request to vscode ', path, leftCommit, rightCommit);
    // see actions/vscode.ts for response handling that comes as a window event
    vscode.postMessage({ path, leftCommit, rightCommit, command: 'diff' });
  } else {
    const pathParam = path && path.trim().length > 0 ? `?path=${path}` : '';
    const leftCommitParam = leftCommit ? `&leftCommit=${leftCommit}` : '';
    const rightCommitParam = rightCommit ? `&rightCommit=${rightCommit}` : '';

    // TODO : replace this with serviceBaseUrl when it is in
    const url = `http://localhost:11966/git-temporal/diff${pathParam}${leftCommitParam}${rightCommitParam}`;
    fetch(url)
      .then(response => response.json())
      .then(diff => dispatch(receiveDiff(path, diff)));
  }
};
