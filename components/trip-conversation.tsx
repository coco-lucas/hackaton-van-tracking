'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Trip, Message } from '@/lib/types'
import { Send, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TripConversationProps {
  trip: Trip | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  userRole: 'motorista' | 'passageiro'
}

export function TripConversation({
  trip,
  open,
  onOpenChange,
  currentUserId,
  userRole,
}: TripConversationProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages - in real app, fetch from API
  useEffect(() => {
    if (open && trip) {
      // Simulate loading messages
      const mockMessages: Message[] = [
        {
          id: '1',
          remetenteId: trip.motorista.id,
          destinatarioId: 'group',
          viagemId: trip.id,
          conteudo: 'Olá pessoal! Viagem confirmada. Saída às ' + format(new Date(trip.dataHoraSaida), 'HH:mm'),
          dataHora: new Date(Date.now() - 3600000).toISOString(),
          lida: true,
          tipo: 'usuario',
        },
        {
          id: '2',
          remetenteId: trip.passageiros[0]?.id || '',
          destinatarioId: 'group',
          viagemId: trip.id,
          conteudo: 'Obrigado! Estarei pronto.',
          dataHora: new Date(Date.now() - 3000000).toISOString(),
          lida: true,
          tipo: 'usuario',
        },
      ]
      setMessages(mockMessages)
    }
  }, [open, trip])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!trip) return null

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      // In real app, send to API
      const message: Message = {
        id: Date.now().toString(),
        remetenteId: currentUserId,
        destinatarioId: 'group',
        viagemId: trip.id,
        conteudo: newMessage,
        dataHora: new Date().toISOString(),
        lida: false,
        tipo: 'usuario',
      }

      setMessages([...messages, message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getUserName = (userId: string) => {
    if (userId === trip.motorista.id) {
      return trip.motorista.nome
    }
    const passenger = trip.passageiros.find(p => p.id === userId)
    return passenger?.nome || 'Usuário'
  }

  const getUserInitials = (userId: string) => {
    const name = getUserName(userId)
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-2xl p-0 flex flex-col [&>button]:hidden"
      >
        {/* Header */}
        <div className="flex flex-col border-b bg-background shrink-0">
          <div className="flex h-4 w-full items-center justify-center">
            <div className="mt-4 h-1.5 w-10 rounded-full bg-muted" />
          </div>

          <div className="flex items-center gap-3 px-4 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1">
              <SheetTitle className="text-lg font-bold">
                Chat da Viagem
              </SheetTitle>
              <SheetDescription className="text-xs">
                {trip.origem.cidade} → {trip.destino.cidade}
              </SheetDescription>
            </div>

            <div className="flex -space-x-2">
              {/* Driver avatar */}
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={trip.motorista.foto} alt={trip.motorista.nome} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getUserInitials(trip.motorista.id)}
                </AvatarFallback>
              </Avatar>
              {/* Passenger avatars */}
              {trip.passageiros.slice(0, 3).map((passenger, index) => (
                <Avatar key={passenger.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={passenger.foto} alt={passenger.nome} />
                  <AvatarFallback className="bg-muted text-xs">
                    {getUserInitials(passenger.id)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {trip.passageiros.length > 3 && (
                <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                  +{trip.passageiros.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.remetenteId === currentUserId
            const senderName = getUserName(message.remetenteId)
            const isDriver = message.remetenteId === trip.motorista.id

            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={isDriver ? 'bg-primary/10 text-primary text-xs' : 'bg-muted text-xs'}>
                    {getUserInitials(message.remetenteId)}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {!isCurrentUser && (
                    <span className="text-xs text-muted-foreground mb-1 px-1">
                      {senderName.split(' ')[0]}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.conteudo}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {format(new Date(message.dataHora), 'HH:mm', { locale: ptBR })}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-background px-4 py-3 shrink-0">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}