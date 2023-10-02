import { Components, Theme, alpha } from '@mui/material'
import { getColorByTheme } from 'lib/material'

export const MuiButton: Components['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      boxSizing: 'border-box',
      borderRadius: '42px',
      textTransform: 'none',

      '& .MuiTouchRipple-ripple .MuiTouchRipple-child': {
        backgroundColor: (theme as Theme).palette.common.white,
      },

      '&:disabled': {
        color: (theme as Theme).palette.interface.grey,
      },
    }),
    sizeLarge: {
      padding: '8px 24px',
    },
    sizeMedium: {
      padding: '5px 16px',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    sizeSmall: {
      padding: '6px 12px',
      lineHeight: 1,
      fontSize: '0.875rem',
    },
    containedPrimary: ({ theme }) => ({
      border: `1px solid ${getColorByTheme(
        theme as Theme,
        (theme as Theme).palette.common.black,
        (theme as Theme).palette.common.white
      )}`,
      backgroundColor: getColorByTheme(
        theme as Theme,
        (theme as Theme).palette.common.black,
        (theme as Theme).palette.common.white
      ),
      color: getColorByTheme(
        theme as Theme,
        (theme as Theme).palette.interface.button,
        (theme as Theme).palette.common.black
      ),

      '&:hover': {
        borderColor: (theme as Theme).palette.core.yellow,
        backgroundColor: (theme as Theme).palette.core.yellow,
        color: (theme as Theme).palette.common.black,
      },

      '&:disabled': {
        opacity: 1,
        borderColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.core.yellowLight,
          'transparent'
        ),
        backgroundColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.core.yellowLight,
          alpha((theme as Theme).palette.core.yellow, 0.08)
        ),
      },
    }),
    containedSecondary: ({ theme }) => ({
      border: `1px solid ${getColorByTheme(
        theme as Theme,
        (theme as Theme).palette.interface.button,
        (theme as Theme).palette.interface.selector
      )}`,
      backgroundColor: getColorByTheme(
        theme as Theme,
        (theme as Theme).palette.interface.button,
        (theme as Theme).palette.interface.selector
      ),
      color: getColorByTheme(
        theme as Theme,
        '#161819',
        (theme as Theme).palette.common.white
      ),

      '&:hover': {
        borderColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.interface.line,
          (theme as Theme).palette.interface.navigation
        ),
        backgroundColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.interface.line,
          (theme as Theme).palette.interface.navigation
        ),
      },

      '&:disabled': {
        borderColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.interface.button,
          (theme as Theme).palette.interface.selector
        ),
        backgroundColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.interface.button,
          (theme as Theme).palette.interface.selector
        ),
      },
    }),
    outlinedSecondary: ({ theme }) => ({
      backgroundColor: 'transparent',
      color: getColorByTheme(
        theme as Theme,
        '#161819',
        (theme as Theme).palette.common.white
      ),
      borderColor: getColorByTheme(
        theme as Theme,
        (theme as Theme).palette.interface.input,
        (theme as Theme).palette.interface.navigation
      ),

      '&:hover': {
        backgroundColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.interface.button,
          (theme as Theme).palette.interface.selector
        ),
        borderColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.interface.input,
          (theme as Theme).palette.interface.navigation
        ),
      },
    }),
    text: ({ theme }) => ({
      color: getColorByTheme(
        theme as Theme,
        '#161819',
        (theme as Theme).palette.common.white
      ),
      border: '1px solid transparent',

      '&:hover': {
        backgroundColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.interface.button,
          (theme as Theme).palette.interface.selector
        ),
        border: `1px solid ${getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.interface.input,
          (theme as Theme).palette.interface.selector
        )}`,
      },
    }),
  },
}
