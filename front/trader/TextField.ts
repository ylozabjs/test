import { Components, Theme } from '@mui/material'
import { getColorByTheme } from 'lib/material'

export const MuiTextField: Components['MuiTextField'] = {
  defaultProps: { size: 'medium' },
  styleOverrides: {
    root: ({ ownerState, theme }) => ({
      '& .MuiFormLabel-root': {
        transform:
          ownerState.size === 'medium'
            ? 'translate(16px, 16px) scale(1);'
            : 'translate(16px, 12px) scale(1)',

        '&.Mui-focused, &.MuiInputLabel-shrink': {
          transform: 'translate(15px, -9px) scale(0.75)',
        },

        '&.MuiFormLabel-colorPrimary': {
          color: getColorByTheme(
            theme as Theme,
            (theme as Theme).palette.interface.grey,
            (theme as Theme).palette.interface.greyText
          ),

          '&.Mui-focused': {
            color: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.black,
              (theme as Theme).palette.common.white
            ),
          },

          '&.Mui-error': {
            color: (theme as Theme).palette.error.main,
          },
        },
      },

      '.MuiInputBase-root': {
        '&.MuiInputBase-colorPrimary': {
          '& .MuiInputBase-input': {
            padding: ownerState.size === 'medium' ? '16px' : '12px 16px',
            color: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.black,
              (theme as Theme).palette.common.white
            ),
          },

          '&:hover:not(.Mui-disabled, .Mui-error) fieldset': {
            borderColor: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.black,
              (theme as Theme).palette.common.white
            ),
          },

          '& fieldset': {
            borderColor: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.interface.input,
              '#414141'
            ),
          },

          '&.Mui-focused fieldset': {
            borderColor: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.black,
              (theme as Theme).palette.common.white
            ),
          },

          '&.Mui-error fieldset, .Mui-error:hover fieldset': {
            borderColor: (theme as Theme).palette.error.main,
          },
        },

        '& fieldset': {
          borderRadius: '8px',
        },

        '&.Mui-disabled fieldset': {
          borderColor: (theme as Theme).palette.interface.selector,
          backgroundColor: getColorByTheme(
            theme as Theme,
            (theme as Theme).palette.interface.button,
            (theme as Theme).palette.interface.selector
          ),
        },
      },
    }),
  },
}
