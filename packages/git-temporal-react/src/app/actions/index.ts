export const REQUEST_COMMITS = 'REQUEST_COMMITS';
export const RECEIVE_COMMITS = 'RECEIVE_COMMITS';
export const SELECT_PATH = 'SELECT_PATH';
export const INVALIDATE_PATH = 'INVALIDATE_PATH';
export const HIGHLIGHT_COMMIT = 'HIGHLIGHT_COMMIT';
export const VIEW_COMMITS = 'VIEW_COMMITS';
export const VIEW_FILES = 'VIEW_FILES';

export const ADD_AUTHOR_FILTER = 'ADD_AUTHOR_FILTER';
export const REMOVE_AUTHOR_FILTER = 'REMOVE_AUTHOR_FILTER';
export const REMOVE_ALL_AUTHOR_FILTERS = 'REMOVE_ALL_AUTHOR_FILTERS';

export const selectPath = path => (dispatch, _getState) => {
  // if this comes from a rename, follow the most current name
  const actualPath = path.replace(/\{(.*)\s=>\s(.*)\}/g, '$2');

  dispatch(fetchCommitsIfNeeded(actualPath));
  return { selectedPath: actualPath, type: SELECT_PATH };
};

export const invalidatePath = path => ({
  selectedPath: path,
  type: INVALIDATE_PATH,
});

export const addAuthorFilter = authorName => ({
  authorName,
  type: ADD_AUTHOR_FILTER,
});

export const removeAuthorFilter = authorName => ({
  authorName,
  type: REMOVE_AUTHOR_FILTER,
});

export const removeAllAuthorFilters = () => ({
  type: REMOVE_ALL_AUTHOR_FILTERS,
});

export const highlightCommit = commitId => ({
  commitId,
  type: HIGHLIGHT_COMMIT,
});

export const viewCommits = () => ({
  type: VIEW_COMMITS,
});

export const viewFiles = () => ({
  type: VIEW_FILES,
});

export const requestCommits = path => ({
  selectedPath: path,
  type: REQUEST_COMMITS,
});

export const receiveCommits = (path, json) => ({
  selectedPath: path,
  commits: json.commits,
  type: RECEIVE_COMMITS,
});

const fetchCommits = path => dispatch => {
  dispatch(requestCommits(path));
  const pathParam = path && path.trim().length > 0 ? `?path=${path}` : '';
  // TODO : replace this with serviceBaseUrl when it is in
  return fetch(`http://localhost:11966/git-temporal/history${pathParam}`)
    .then(response => response.json())
    .then(json => dispatch(receiveCommits(path, json)));
};

const shouldFetchCommits = (state, path) => {
  if (state.isFetching) {
    return false;
  }
  return (
    state.didInvalidate ||
    !state.commits ||
    state.commits.length <= 0 ||
    state.selectedPath !== path
  );
};

export const fetchCommitsIfNeeded = path => (dispatch, getState) => {
  if (shouldFetchCommits(getState(), path)) {
    return dispatch(fetchCommits(path));
  }
};
