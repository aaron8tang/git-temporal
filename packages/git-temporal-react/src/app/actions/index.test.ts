import reduxMockStore from 'redux-mock-store';
import reduxThunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import fiveCommits from 'testHelpers/mocks/fiveCommits';
import basicReduxState from 'testHelpers/mocks/basicReduxState';

// actions is globally mocked for all tests
const actions = require.requireActual('./index');

const mockStore = reduxMockStore([reduxThunk.withExtraArgument({ fetch })]);

const nonExistentTestPath = 'testPath/no/exist';
const existingTestPath = 'testPath1'; // see mock for commitsByPath

describe('actions', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  test('fetchCommitsIfNeeded(existingPath) should not trigger any other actions', async done => {
    const store = mockStore(basicReduxState);
    await store.dispatch(actions.fetchCommitsIfNeeded(existingTestPath));
    expect(store.getActions()).toEqual([]);
    done();
  });

  test('fetchCommitsIfNeeded(existingPath) should not trigger any other actions if already fetching', async done => {
    const alteredState = Object.assign({}, basicReduxState);
    alteredState.commitsByPath[existingTestPath].isFetching = true;
    const store = mockStore(alteredState);
    await store.dispatch(actions.fetchCommitsIfNeeded(existingTestPath));
    expect(store.getActions()).toEqual([]);
    done();
  });

  test('fetchCommitsIfNeeded(nonExistentPath)', async done => {
    const store = mockStore(basicReduxState);
    fetchMock.getOnce('http://localhost:11966/git-temporal/history', {
      body: JSON.stringify(fiveCommits),
    });
    const expectedActions = [
      { type: actions.REQUEST_COMMITS, path: nonExistentTestPath },
      {
        type: actions.RECEIVE_COMMITS,
        selectedPath: nonExistentTestPath,
        commits: fiveCommits,
      },
    ];
    await store.dispatch(actions.fetchCommitsIfNeeded(nonExistentTestPath));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  test('selectPath(existingPath) should not trigger any other actions', async done => {
    const store = mockStore(basicReduxState);
    await store.dispatch(actions.selectPath(existingTestPath));
    expect(store.getActions()).toEqual([]);
    done();
  });

  test('selectPath(nonExistentPath) should trigger fetch', async done => {
    const store = mockStore(basicReduxState);
    fetchMock.getOnce('http://localhost:11966/git-temporal/history', {
      body: JSON.stringify(fiveCommits),
    });
    const expectedActions = [
      { type: actions.REQUEST_COMMITS, path: nonExistentTestPath },
    ];
    await store.dispatch(actions.selectPath(nonExistentTestPath));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});