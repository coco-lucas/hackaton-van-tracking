'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { UserCircle, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { PasswordResetConfirmDialog } from './password-reset-confirm-dialog'

interface ProfileDialogProps {
  nome: string
  cpf: string
  children?: React.ReactNode
}

export function ProfileDialog({ nome, cpf, children }: ProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [passwordResetOpen, setPasswordResetOpen] = useState(false)

  const formatCPF = (cpf: string): string => {
    // Remove non-digits
    const cleaned = cpf.replace(/\D/g, '')
    // Format as XXX.XXX.XXX-XX
    if (cleaned.length !== 11) return cpf
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  const handlePasswordClick = () => {
    setOpen(false)
    setTimeout(() => {
      setPasswordResetOpen(true)
    }, 200)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="ghost" size="icon">
              <UserCircle className="h-5 w-5" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Perfil do Motorista</DialogTitle>
            <DialogDescription>
              Informações da sua conta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profile-nome">Nome</Label>
              <Input
                id="profile-nome"
                value={nome}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-cpf">CPF</Label>
              <Input
                id="profile-cpf"
                value={formatCPF(cpf)}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-senha">Senha</Label>
              <div className="relative">
                <Input
                  id="profile-senha"
                  type="password"
                  value="••••••••"
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                  onClick={handlePasswordClick}
                >
                  <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                  Trocar senha
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Clique em "Trocar senha" para solicitar uma redefinição
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PasswordResetConfirmDialog
        open={passwordResetOpen}
        onOpenChange={setPasswordResetOpen}
        userName={nome}
      />
    </>
  )
}
