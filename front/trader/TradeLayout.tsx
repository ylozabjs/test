import { styled } from '@mui/material/styles'

export const TradeLayout = styled('div')(({ theme }) => ({
  '& section:nth-of-type(n)': {
    border: `1px solid ${theme.palette.interface.line}`,
    borderRadius: '8px',
  },

  '& section:nth-of-type(1)': {
    gridArea: 'A',
  },

  '& section:nth-of-type(2)': {
    gridArea: 'B',
  },

  '& section:nth-of-type(3)': {
    gridArea: 'C',
  },

  '& section:nth-of-type(4)': {
    gridArea: 'D',
  },

  '& section:nth-of-type(5)': {
    gridArea: 'E',
  },

  [theme.breakpoints.up('md')]: {
    display: 'grid',
    gap: '4px',
    padding: '0 4px',
    gridTemplateAreas: `
        "C  C"
        "A  D"
        "A  B"
        "E  E"
      `,
    gridTemplateRows: 'max-content max-content max-content auto',
    gridTemplateColumns: '300px auto',
  },

  [theme.breakpoints.up('lg')]: {
    display: 'grid',
    gap: '4px',
    padding: '0 4px',
    gridTemplateAreas: `
        "A  C  C "
        "A  B  D "
        "A  E  E "
      `,
    gridTemplateRows: 'max-content max-content auto',
    gridTemplateColumns: '300px 300px 1fr',
  },

  [theme.breakpoints.up('xl')]: {
    display: 'grid',
    gap: '4px',
    padding: '0 4px',
    gridTemplateAreas: `
        "A  B  C "
        "A  B  D "
        "A  E  E "
      `,
    gridTemplateRows: 'max-content max-content auto',
    gridTemplateColumns: '340px 340px 1fr',
  },
}))
