import { Components, Theme, alpha } from '@mui/material'
import { getColorByTheme } from 'lib/material'

export const MuiSwitch: Components['MuiSwitch'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      width: 52,
      height: 32,
      padding: 0,
      '& .MuiSwitch-switchBase': {
        padding: 8,
        transition: (theme as Theme).transitions.create(
          ['padding', 'transform'],
          { duration: 300 }
        ),

        '&:hover': {
          backgroundColor: 'rgba(135, 135, 135, 0.08)',
        },

        '&.Mui-checked': {
          transform: 'translateX(20px)',
          color: (theme as Theme).palette.common.white,
          padding: 4,
          '& + .MuiSwitch-track': {
            backgroundColor: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.black,
              (theme as Theme).palette.common.white
            ),
            opacity: 1,
            borderColor: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.black,
              (theme as Theme).palette.common.white
            ),
          },
          '& .MuiSwitch-thumb': {
            width: 24,
            height: 24,
            backgroundColor: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.white,
              (theme as Theme).palette.common.black
            ),
          },
        },
        '&.Mui-disabled': {
          '& + .MuiSwitch-track': {
            opacity: 0.5,
            borderColor: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.black,
              alpha((theme as Theme).palette.interface.input, 0.5)
            ),
          },
          '& .MuiSwitch-thumb': {
            opacity: 0.5,
            backgroundColor: getColorByTheme(
              theme as Theme,
              (theme as Theme).palette.common.white,
              alpha((theme as Theme).palette.interface.input, 0.5)
            ),
          },
        },
        '&.Mui-focusVisible': {
          '& + .MuiSwitch-track': {
            borderColor: (theme as Theme).palette.common.black,
          },

          '& .MuiSwitch-thumb': {
            backgroundColor: (theme as Theme).palette.common.black,
          },

          '& .MuiTouchRipple-root': {
            backgroundColor: (theme as Theme).palette.interface.grey,
            opacity: 0.2,
          },
        },
      },
      '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 16,
        height: 16,
        margin: 0,
        boxShadow: 'none',
        backgroundColor: (theme as Theme).palette.interface.grey,
        transition: (theme as Theme).transitions.create(
          ['width', 'height', 'background-color'],
          { duration: 300 }
        ),
      },
      '& .MuiSwitch-track': {
        borderRadius: 35,
        backgroundColor: getColorByTheme(
          theme as Theme,
          (theme as Theme).palette.common.white,
          (theme as Theme).palette.common.black
        ),
        border: `2px solid ${(theme as Theme).palette.interface.grey}`,
        boxSizing: 'border-box',
        opacity: 1,
        transition: (theme as Theme).transitions.create(
          ['background-color', 'border-color'],
          { duration: 300 }
        ),
      },
    }),
  },
}
