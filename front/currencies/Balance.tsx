import styled from '@emotion/styled'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'

import { formatToken } from '@/utils/currency'
import { noop } from '@/utils/fn'

import { useStores } from '../../mobx'
import { pollPromise } from '../../utils/poll'
import Card from '../Common/Card'
import { Title } from '../Common/Title/Title.styled'
import EditWalletAlias from '../EditWalletAlias'
import Faucet from '../Faucet/Faucet'

const CardStyled = styled(Card)(() => ({
  width: '100%',
}))

const Amount = styled.div((props) => ({
  color: props.theme.colors.text,
  fontWeight: 900,
  fontSize: '28px',

  [props.theme.mediaQueries.mobileS]: {
    fontSize: 18,
  },
  [props.theme.mediaQueries.tablet]: {
    fontSize: 22,
  },
  [props.theme.mediaQueries.laptop]: {
    fontSize: 24,
  },
  [props.theme.mediaQueries.laptopL]: {
    fontSize: 28,
  },
}))

const AliasWrapper = styled.div({
  display: 'inline-flex',
  cursor: 'pointer',
  transition: 'opacity 200ms',
  '> i': {
    opacity: 0.5,
  },

  '&:hover': {
    '> i': {
      opacity: 1,
    },
  },
})

const Symbol = styled.span({
  fontWeight: 500,
  fontSize: '20px',
})

const EditIcon = styled.i()

const Address = styled.span(({ theme }) => ({
  [theme.mediaQueries.mobileS]: { fontSize: 12 },
  [theme.mediaQueries.tablet]: { fontSize: 14 },
}))

const Balance = () => {
  const { walletStore, accountStore } = useStores()
  const [balance, setBalance] = useState(0)
  const [editAlias, setEditAlias] = useState(false)

  useEffect(() => {
    const ac = new AbortController()

    pollPromise(
      () =>
        walletStore
          .getBalance()
          .then((newBalance) => {
            setBalance(newBalance)
          })
          .catch(noop),
      ac.signal,
      Infinity,
      5000,
      false,
    ).catch(noop)
    return () => {
      ac.abort()
    }
  }, [accountStore.activeAccount?.address])

  return (
    <>
      <CardStyled className='h-full'>
        <div>
          <AliasWrapper onClick={() => setEditAlias(true)}>
            <Title>{walletStore.getWalletAlias()}</Title>
            <EditIcon className='pi pi-pencil ml-2' />
          </AliasWrapper>
          <div className='flex gap-2 mt-5'>
            <Amount>{formatToken(balance)}</Amount>
            <Symbol>GRP</Symbol>
          </div>
          <div className='mt-5'>
            <p style={{ opacity: 0.8 }}>Active Account ID:</p>
            <Address>{accountStore.activeAccount?.address}</Address>
          </div>
          <div className='mt-5'>
            <Faucet />
          </div>
        </div>
      </CardStyled>
      <EditWalletAlias visible={editAlias} onClose={() => setEditAlias(false)} />
    </>
  )
}

export default observer(Balance)
