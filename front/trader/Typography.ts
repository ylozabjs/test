import { Components } from '@mui/material'

export const MuiTypography: Components['MuiTypography'] = {
  defaultProps: {
    variantMapping: {
      body24: 'p',
      body16: 'p',
      body14: 'p',
      body12: 'p',
      body10: 'p',
    },
  },
  styleOverrides: {
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.25,
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.3333,
    },
    h5: {
      fontWeight: 700,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  variants: [
    {
      props: {
        variant: 'body24',
      },
      style: {
        fontSize: '1.5rem',
        lineHeight: 1.33333,
      },
    },
    {
      props: {
        variant: 'body16',
      },
      style: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
    },
    {
      props: {
        variant: 'body14',
      },
      style: {
        fontSize: '0.875rem',
        lineHeight: 1.285714,
      },
    },
    {
      props: {
        variant: 'body12',
      },
      style: {
        fontSize: '0.75rem',
        lineHeight: 1.33333,
      },
    },
    {
      props: {
        variant: 'body10',
      },
      style: {
        fontSize: '0.625rem',
        lineHeight: 1.6,
      },
    },
  ],
}
