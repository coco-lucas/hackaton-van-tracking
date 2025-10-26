'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { useState } from 'react'

interface PasswordResetConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
}

export function PasswordResetConfirmDialog({
  open,
  onOpenChange,
  userName,
}: PasswordResetConfirmDialogProps) {
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleConfirm = async () => {
    setIsSending(true)

    // Simular envio de mensagem para suporte
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSending(false)
    setSent(true)

    // Fechar o dialog após 2 segundos
    setTimeout(() => {
      onOpenChange(false)
      // Reset state quando fechar
      setTimeout(() => setSent(false), 300)
    }, 2000)
  }

  const handleCancel = () => {
    if (!isSending) {
      onOpenChange(false)
      setTimeout(() => setSent(false), 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!sent ? (
          <>
            <DialogHeader>
              <DialogTitle>Solicitar Troca de Senha</DialogTitle>
              <DialogDescription>
                Deseja enviar uma mensagem para o suporte solicitando a troca de senha{userName ? ` para ${userName}` : ''}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Mensagem para Suporte</p>
                  <p className="text-xs text-muted-foreground">
                    Será enviada uma solicitação de redefinição de senha
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={isSending}>
                {isSending ? 'Enviando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Solicitação Enviada!</DialogTitle>
              <DialogDescription>
                Sua solicitação foi enviada com sucesso para o suporte.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  O suporte entrará em contato em breve para ajudá-lo com a redefinição da senha.
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}