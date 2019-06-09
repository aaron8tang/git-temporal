export type ModifiedFileStatuses = 'modified' | 'added' | 'deleted';

export interface GitTemporalProps {
  // If not provided, the whole repository is assumed
  path?: string;
  serviceBaseUrl?: string;
}

export interface StateProps {
  selectedPath?: string;
  commits?: ICommit[];
  isFetching?: boolean;
  isEmpty?: boolean;
  lastUpdated?: number;
}

export interface DispatchProps {
  dispatch?: (action: any) => void;
}

export interface TestProps {
  testId?: string;
}

export interface ICommitFile {
  name: string;
  linesAdded: number;
  linesDeleted: number;
}

export interface ICommit {
  id: string;
  authorName: string;
  relativeDate: string;
  authorDate: number;
  message: string;
  body: string;
  hash: string;
  linesAdded: number;
  linesDeleted: number;
  files: ICommitFile[];
}

export interface IDiff {
  isDirectory: boolean;
  leftCommit: string;
  leftFileContents: string;
  rightCommit: string;
  rightFileContents: string;
  modifiedFiles: IModifiedFile[];
  path: string;
}

export interface IModifiedFile {
  status: ModifiedFileStatuses;
  path: string;
  delta: number;
}

export interface IHeaderContainerState {
  // If not provided, the whole repository is assumed
  selectedPath?: string;
  search?: string;
  startDate?: number;
  endDate?: number;
  isDefaultDates?: boolean;
}

export interface ICommitsContainerState {
  selectedPath: string;
  highlightedCommitIds: string[];
  commits: ICommit[];
  isFetching: boolean;
  isFileSelected: boolean;
  commitsContainerSort: string;
}

export interface IAuthorStats {
  authorName: string;
  authorEmails: string[];
  linesAdded: number;
  linesDeleted: number;
  commits: ICommit[];
  firstCommitOn: number;
  lastCommitOn: number;
}
export interface IAuthorsContainerState {
  authors?: any[];
  totalLinesAdded: number;
  totalLinesDeleted: number;
  totalCommits: number;
  maxImpact: number;
  maxCommits: number;
  authorsContainerSort: string;
  highlightedCommitIds: string[];
}

export interface IFileStats {
  fileName: string;
  authorNames: string[];
  linesAdded: number;
  linesDeleted: number;
  commits: ICommit[];
  firstCommitOn: number;
  lastCommitOn: number;
}
export interface IFilesContainerState {
  files?: IFileStats[];
  isFileSelected: boolean;
  filesContainerSort: string;
}

export interface ITimeplotState {
  selectedPath: string;
  highlightedCommitIds: string[];
  commits: ICommit[];
  authors: number;
  startDate: number;
  endDate: number;
  rerenderRequestedAt: Date;
}

export interface IDifferenceViewerContainerState {
  selectedPath: string;
  commits: ICommit[];
  filteredCommits: ICommit[];
  startDate: number;
  endDate: number;
  diff: IDiff;
  isDiffFetching: boolean;
  rerenderRequestedAt: Date;
}
export interface IDifferenceViewerHeaderState {
  timeplotCommits?: ICommit[];
  filteredCommits?: ICommit[];
  startDate?: number;
  endDate?: number;
}
