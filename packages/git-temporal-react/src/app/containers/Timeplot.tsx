import React from 'react';
import { connect } from 'react-redux';
import { style } from 'app/styles';
import { ITimeplotState, ICommit, DispatchProps } from 'app/interfaces';

import { getTimeplotContainerState } from 'app/selectors';
import { setStartDate, setEndDate } from 'app/actions';

import { debounce } from 'app/utilities/debounce';
import { throttle } from 'app/utilities/throttle';
import { ZoomContainer, ICustomZoom } from 'app/components/ZoomContainer';
import { TimeplotGraph } from 'app/components/TimeplotGraph';
import { EpochSpan } from 'app/components/EpochSpan';
import { CommaNumber } from 'app/components/CommaNumber';

import {
  TimeplotPopup,
  TIMEPLOT_POPUP_WIDTH,
} from 'app/components/TimeplotPopup';

import { filterCommitsForSpan } from 'app/utilities/commits';

interface TimeplotLocalState {
  hoverMarkerLeft: number;
  scrollLeft: number;
  popupOpen: boolean;
  timeplotRenders: number;
  popupCommits: ICommit[];
  popupStartDate?: Date;
  popupEndDate?: Date;
  customZooms: ICustomZoom[];
}

const initialState = {
  // TODO: this should be a constant. I think it's used elsewhere?
  hoverMarkerLeft: -40, // -40 = out of sight
  scrollLeft: 0,
  popupOpen: false,
  timeplotRenders: 0,
  popupCommits: [],
  popupStartDate: null,
  popupEndDate: null,
  customZooms: [],
};

const outerStyle = {
  _extends: ['borderedPanel', 'flexColumns'],
  flexGrow: 0,
  position: 'relative',
  marginTop: 10,
  minHeight: 100,
};

const statsStyle = {
  _extends: 'normalText',
  width: '100%',
  textAlign: 'center',
};

const timeplotStyle = {
  _extends: 'fill',
};

const markerStyle = {
  position: 'absolute',
  height: 130,
  width: 10,
  opacity: 0.5,
  zIndex: 1,
  top: 0,
};

const hoverMarkerStyle = {
  _extends: markerStyle,
  backgroundColor: '@colors.selectable',
};

export class Timeplot extends React.Component<
  ITimeplotState & DispatchProps,
  TimeplotLocalState
> {
  readonly state: TimeplotLocalState = initialState;
  private timeplotRef;
  private debouncedOnMouseLeave;
  private debouncedOnMouseMove;
  private lastMouseMoveCoords: { pageX: number; pageY: number };
  private lastMouseDownDate;

  constructor(props) {
    super(props);
    this.timeplotRef = React.createRef();
    this.debouncedOnMouseLeave = debounce(this.onMouseLeave, 100);
    this.debouncedOnMouseMove = throttle(this.onMouseMove, 0);
  }

  componentDidUpdate(prevProps, prevState) {
    this.timeplotRef.current.focus();
    if (
      prevProps.startDate !== this.props.startDate ||
      prevProps.endDate !== this.props.endDate
    ) {
      this.addCustomZooms();
    }
    if (prevState.timeplotRenders !== this.state.timeplotRenders) {
      const timeplot = this.timeplotRef.current;
      if (timeplot && this.props.startDate) {
        this.setState({
          scrollLeft: timeplot.xScale(this.props.startDate * 1000) - 33,
        });
      }
    }
  }

  render() {
    const { commits = [], startDate, endDate } = this.props;
    const popupLeft =
      this.state.hoverMarkerLeft - this.state.scrollLeft <
      TIMEPLOT_POPUP_WIDTH + 20
        ? this.state.hoverMarkerLeft - this.state.scrollLeft + 20
        : this.state.hoverMarkerLeft -
          this.state.scrollLeft -
          TIMEPLOT_POPUP_WIDTH +
          30;
    const firstCommitTime = commits[commits.length - 1].authorDate;
    const lastCommitTime = commits[0].authorDate;

    return (
      <div style={style(outerStyle)}>
        <ZoomContainer
          onZoom={this.onZoom}
          onMouseLeave={this.debouncedOnMouseLeave}
          onScroll={this.onScroll}
          customZooms={this.state.customZooms}
          scrollLeft={this.state.scrollLeft}
        >
          <TimeplotGraph
            forceRender={this.state.timeplotRenders}
            commits={this.props.commits}
            style={style(timeplotStyle)}
            ref={this.timeplotRef}
            highlightedCommitId={this.props.highlightedCommitId}
            startDate={startDate}
            endDate={endDate}
            onMouseMove={this.debouncedOnMouseMove}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
          />
          <div
            style={style(hoverMarkerStyle, {
              left: this.state.hoverMarkerLeft,
            })}
            onMouseMove={this.onMouseHoverMarker}
            onMouseEnter={this.onMouseHoverMarker}
          />
          <TimeplotPopup
            commits={this.state.popupCommits}
            isOpen={this.state.popupOpen}
            startDate={this.state.popupStartDate}
            endDate={this.state.popupEndDate}
            left={popupLeft}
            onClose={this.onPopupClose}
            onCommitSelected={this.onCommitSelected}
          />
        </ZoomContainer>

        <div style={style(statsStyle)}>
          <CommaNumber value={this.props.commits.length} /> commits spanning{' '}
          <EpochSpan
            firstEpochTime={firstCommitTime}
            secondEpochTime={lastCommitTime}
          />
        </div>
      </div>
    );
  }

  private onPopupClose = () => {
    this.setState({ popupOpen: false });
  };

  private onScroll = scrollLeft => {
    this.setState({ scrollLeft });
  };

  private onZoom = () => {
    this.setState({
      timeplotRenders: this.state.timeplotRenders + 1,
    });
  };

  private onMouseLeave = _evt => {
    this.setState({ popupOpen: false, hoverMarkerLeft: -40 });
  };

  private onMouseMove = (evt, { startDate, endDate, relativeLeft }) => {
    const popupCommits = filterCommitsForSpan(
      this.props.commits,
      startDate,
      endDate
    );
    const { pageX, pageY } = evt;
    // console.log('onMouseMove', pageX, pageY);
    // this enables greater agility, if the users vertical movement is
    // greater than their horizontal, they might be headed to the popup
    if (!this.lastMouseMoveCoords || pageY >= this.lastMouseMoveCoords.pageY) {
      this.setState({
        popupCommits,
        popupOpen: true,
        popupStartDate: startDate,
        popupEndDate: endDate,
        // +3 : the marker needs to not get in the way of clicking the graph underneath
        //    otherwise you end up clicking on the marker itself
        hoverMarkerLeft: relativeLeft + 3,
      });
    }
    this.lastMouseMoveCoords = { pageX, pageY };
  };

  private onMouseDown = (evt, { startDate }) => {
    evt.preventDefault();
    this.lastMouseDownDate = startDate;
    this.setDates(evt.shiftKey, startDate);
  };

  private onMouseUp = (evt, { startDate }) => {
    evt.preventDefault();
    if (
      this.lastMouseDownDate &&
      startDate.toString() !== this.lastMouseDownDate.toString()
    ) {
      // console.log('startDate differs', startDate, this.lastMouseDownDate);
      this.setDates(true, startDate);
    }
  };

  private onMouseHoverMarker = evt => {
    this.setState({
      hoverMarkerLeft:
        this.state.hoverMarkerLeft + (evt.pageX - evt.clientX) + 3,
    });
  };

  private onCommitSelected = (evt, commit) => {
    evt.stopPropagation();
    // console.log('onCommitSelected', evt, commit, this.props.startDate);
    // TODO: test: you should be able to isolate a single commit (`+ 1` below)
    // if the user clicks the same commit twice we select just that commit
    if (commit.authorDate === this.props.startDate) {
      this.setDates(true, commit.authorDate * 1000 + 1);
    } else {
      this.setDates(evt.shiftKey, commit.authorDate * 1000);
    }
  };

  private setDates(shiftKey, date) {
    const epochDate = Math.floor(date / 1000);
    const { dispatch, startDate, endDate } = this.props;
    if (!startDate && !endDate) {
      dispatch(setStartDate(epochDate));
    } else if (startDate) {
      if (shiftKey) {
        if (epochDate < startDate) {
          dispatch(setEndDate(startDate));
          dispatch(setStartDate(epochDate));
        } else {
          dispatch(setEndDate(epochDate));
        }
      } else {
        if (endDate && epochDate > endDate) {
          dispatch(setStartDate(endDate));
          dispatch(setEndDate(epochDate));
        } else {
          dispatch(setStartDate(epochDate));
        }
      }
    }
  }

  private addCustomZooms() {
    const { startDate, endDate } = this.props;
    if (!startDate || !this.timeplotRef.current) {
      this.setState({ customZooms: [] });
      return;
    }
    const { xScale, getScrollWidth } = this.timeplotRef.current;
    const defaultedEndDate = endDate ? endDate * 1000 : new Date();
    const spanLeft = xScale(startDate * 1000);
    const spanRight = xScale(defaultedEndDate);
    const span = spanRight - spanLeft + 6;
    if (span <= 0) {
      this.setState({ customZooms: [] });
      return;
    }
    const scrollWidth = getScrollWidth();
    this.setState({
      customZooms: [
        {
          value: Math.floor((scrollWidth / span) * 100),
          label: 'Zoom to selected time span',
        },
      ],
    });
  }
}

export default connect(getTimeplotContainerState)(Timeplot);