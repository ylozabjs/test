import { createTheme, useMediaQuery } from '@mui/material'
import { darkTheme, lightTheme } from 'lib/material'
import { useEffect, useMemo, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Mode = 'light' | 'dark' | 'system'

interface UseColorMode {
  mode: Mode
  toggle: () => void
  setMode: (mode: Mode) => void
}

export const useColorModeStore = create<UseColorMode>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set(() => ({ mode })),
      toggle: () =>
        set(({ mode }) => ({ mode: mode === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'ui-mode' }
  )
)

export const useGetThemeByColorMode = () => {
  const colorMode = useColorModeStore((state) => state.mode)
  const [mode, setMode] = useState('system')
  const isSystemDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  })

  useEffect(() => {
    if (colorMode === 'system') {
      setMode(isSystemDarkMode ? 'dark' : 'light')
    } else {
      setMode(colorMode)
    }
  }, [colorMode, isSystemDarkMode])

  const theme = useMemo(() => {
    return createTheme(mode === 'dark' ? darkTheme : lightTheme)
  }, [mode])

  return theme
}
