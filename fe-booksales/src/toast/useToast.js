import { useContext } from 'react'
import { ToastContext } from './ToastContext.js'

// Pemakaian: const toast = useToast(); toast.success('Judul', { message, action: { label, to } })
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>')
  return ctx
}
