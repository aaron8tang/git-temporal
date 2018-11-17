import React from 'react';
// import { style } from 'app/styles';

export interface UndoIconProps {
  width?: number;
  height?: number;
  style?: object;
}

export const UndoIcon = (props: UndoIconProps): JSX.Element => {
  const { width = 16, height = 16 } = props;

  return (
    <svg
      width={width}
      height={height}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        fill="currentColor"
        d="M255.545 8c-66.269.119-126.438 26.233-170.86 68.685L48.971 40.971C33.851 25.851 8 36.559 8 57.941V192c0 13.255 10.745 24 24 24h134.059c21.382 0 32.09-25.851 16.971-40.971l-41.75-41.75c30.864-28.899 70.801-44.907 113.23-45.273 92.398-.798 170.283 73.977 169.484 169.442C423.236 348.009 349.816 424 256 424c-41.127 0-79.997-14.678-110.63-41.556-4.743-4.161-11.906-3.908-16.368.553L89.34 422.659c-4.872 4.872-4.631 12.815.482 17.433C133.798 479.813 192.074 504 256 504c136.966 0 247.999-111.033 248-247.998C504.001 119.193 392.354 7.755 255.545 8z"
      />
    </svg>
  );
};

// required for stateless functional components to show name in enzyme snapshots:
// https://github.com/adriantoine/enzyme-to-json/issues/19#issuecomment-285781119
UndoIcon.displayName = 'UndoIcon';
