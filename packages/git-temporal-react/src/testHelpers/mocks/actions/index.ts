jest.mock('app/actions', () => {
  const mockedActions = {};
  const actionsToMock = [
    'selectPath',
    'invalidatePath',
    'requestCommits',
    'receiveCommits',
    'fetchCommitsIfNeeded',
  ];
  for (const methodName of actionsToMock) {
    mockedActions[methodName] = jest.fn(path => {
      return jest.fn(() => {
        return path;
      });
    });
  }
  return mockedActions;
});