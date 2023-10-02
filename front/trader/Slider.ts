import { Components, Theme } from '@mui/material'
import { getColorByTheme } from 'lib/material'

export const MuiSlider: Components['MuiSlider'] = {
  defaultProps: {
    valueLabelDisplay: 'auto',
  },
  styleOverrides: {
    root: ({ theme, ownerState }) => ({
      color: (theme as Theme).palette.core.vivaMagenta,
      height: ownerState.orientation === 'vertical' ? '100%' : '4px',

      '& .MuiSlider-markLabel': {
        transform: 'translateX(-18%)',
      },

      '& .MuiSlider-track': {
        border: 'none',
      },

      '& .MuiSlider-rail': {
        opacity: 1,
        color: getColorByTheme(theme as Theme, '#D1D8DF', '#404040'),
        borderRadius: 0,
      },

      '& .MuiSlider-valueLabel': {
        backgroundColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.common.black,
          (theme as Theme).palette.common.white
        ),
        color: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.common.white,
          (theme as Theme).palette.common.black
        ),
        fontSize: '14px',
        padding: '4px',
        lineHeight: 1,

        '&::before': {
          width: '6px',
          height: '6px',
          borderRadius: '0 0 2px 0',
        },
      },

      '& .MuiSlider-thumb': {
        transform: 'translate(-25%, -51%)',
        border: `6px solid currentColor`,
        backgroundColor: (theme as Theme).palette.common.white,

        '&, &.Mui-focusVisible, &:hover': {
          boxShadow: 'none',
        },

        '&:before': {
          display: 'none',
        },
      },

      '& .MuiSlider-mark': {
        '&.MuiSlider-markActive': {
          backgroundColor: (theme as Theme).palette.common.white,
          borderColor: (theme as Theme).palette.core.vivaMagenta,
          opacity: 1,
        },

        backgroundColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.common.white,
          (theme as Theme).palette.common.black
        ),
        height: 6,
        width: 6,
        borderRadius: '100%',
        border: `3px solid ${
          (theme as Theme).palette.mode === 'light' ? '#D1D8DF' : '#404040'
        } `,
      },
    }),
  },
}
