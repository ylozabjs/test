import { cx } from '@emotion/css'
import styled from '@emotion/styled'
import { useFormik } from 'formik'
import { Toast } from 'primereact/toast'
import { useEffect, useRef, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import * as Yup from 'yup'

import { Title } from '@/components/Common/Title/Title.styled'
import UIControlIds from '@/const/ui-contol-ids'
import { useDevice } from '@/hooks/useDevice'
import { useStores } from '@/mobx'
import { parseToken } from '@/utils/currency'
import { getErrorMsg } from '@/utils/errors'
import { noop } from '@/utils/fn'

import Button from '@common/Button'
import Card from '@common/Card'
import Dialog from '@common/Dialog'
import Input from '@common/Input'

const CardStyled = styled(Card)(({ theme }) => ({
  width: '100%',
}))

const MAX_NUMBER_LENGTH = 20
const MIN_AMOUNT = parseToken('0.000000000000000001')

const schema = Yup.object().shape({
  amount: Yup.string().test('amount', (value) => {
    if (value === undefined || value === '') return false
    return parseToken(value).gte(MIN_AMOUNT)
  }),
  walletId: Yup.string()
    .required('Required')
    .matches(/^0x[a-fA-F0-9]{40}$/), // eth-like address
})

type InitialValues = {
  walletId: string
  amount: string
}

type Props = {
  successTransferCb?: () => void
}
const Transfer: React.FC<Props> = ({ successTransferCb = noop }) => {
  const [confirmDialog, setConfirmDialog] = useState(false)
  const { walletStore, accountStore } = useStores()

  const toast = useRef<Toast>(null)

  const formik = useFormik<InitialValues>({
    initialValues: {
      walletId: '',
      amount: '',
    },
    validationSchema: schema,
    onSubmit: () => setConfirmDialog(true),
  })

  useEffect(() => {
    formik.resetForm()
  }, [accountStore.activeAccount?.address])

  const onConfirmTransfer = () => {
    walletStore
      .sendTransaction({ amount: formik.values.amount, recepient: formik.values.walletId })
      .then(() => {
        showSuccessToast()
        successTransferCb()
      })
      .catch(showErrorToast)
      .finally(closeConfirmationDialog)
  }

  const showSuccessToast = () => {
    toast.current?.show({
      severity: 'success',
      detail: 'Success!',
      life: 3000,
    })
  }

  const showErrorToast = (e: unknown) => {
    toast.current?.show({
      severity: 'error',
      detail: getErrorMsg(e) || 'Some error happend!',
      life: 3000,
    })
  }

  const closeConfirmationDialog = () => {
    setConfirmDialog(false)
    formik.resetForm()
  }

  return (
    <>
      <CardStyled style={{ width: '100%' }}>
        <div>
          <Title style={{ marginTop: 0 }} className='mb-2'>
            Make Transfer
          </Title>
          <form onSubmit={formik.handleSubmit} id={UIControlIds.TransferForm}>
            <div className='flex flex-column'>
              <div className='flex flex-column gap-2'>
                <Input
                  placeholder='Wallet ID'
                  id={UIControlIds.TransferFormWalletId}
                  name='walletId'
                  value={formik.values.walletId}
                  onChange={formik.handleChange}
                  className='mb-2'
                  label='Recipient'
                />
              </div>
              <div className='flex flex-column gap-2'>
                <NumericFormat
                  onValueChange={(e) => {
                    formik.setFieldValue('amount', e.value)
                  }}
                  placeholder='0 GRP'
                  name='amount'
                  allowNegative={false}
                  value={formik.values.amount}
                  valueIsNumericString={true}
                  customInput={Input}
                  label='Amount GRP'
                  displayType='input'
                  type='text'
                  suffix=' GRP'
                  isAllowed={(values) => {
                    const { value } = values
                    return value.length <= MAX_NUMBER_LENGTH
                  }}
                  id={UIControlIds.TransferFormAmount}
                />
              </div>
            </div>
            <div className='mt-2'>
              <Button
                type='submit'
                disabled={!formik.isValid || !formik.dirty}
                label='Send'
                id={UIControlIds.TransferFormSubmit}
              />
            </div>
          </form>
        </div>
      </CardStyled>

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog} header='Are you sure?'>
        <div>
          <p style={{ fontSize: 18 }}>Amount</p>
          <p style={{ fontSize: 18, fontWeight: 'bold' }}> {formik.values.amount} GRP</p>
          <div className='flex gap-5'>
            <Button
              mode='outline'
              label='Close'
              onClick={closeConfirmationDialog}
              id={UIControlIds.TransferDeclineButton}
            />
            <Button
              label='Confirm'
              onClick={onConfirmTransfer}
              id={UIControlIds.TransferConfirmButton}
            />
          </div>
        </div>
      </Dialog>

      <Toast ref={toast} />
    </>
  )
}

export default Transfer
