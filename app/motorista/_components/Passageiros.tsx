'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Mock de passageiros
const mockConfirmados = [
  { id: 1, nome: 'João Silva', destino: 'São Paulo' },
]
const mockPendentes = [
  { id: 2, nome: 'Maria Oliveira', destino: 'Rio de Janeiro' },
  { id: 3, nome: 'Pedro Santos', destino: 'Belo Horizonte' },
  { id: 4, nome: 'Ana Costa', destino: 'Curitiba' }
]

export default function PassageirosPage() {
  return (
    <div className="space-y-6">
      {/* Passageiros Confirmados */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Confirmados</h2>
        {mockConfirmados.map((p) => (
          <Card key={p.id} className="trip-card-shadow">
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <p className="font-semibold text-foreground">{p.nome}</p>
                <p className="text-sm text-muted-foreground">{p.destino}</p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => alert(`Removido o booking de ${p.nome}`)}
              >
                X
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Passageiros Pendentes */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Pendentes</h2>
        {mockPendentes.map((p) => (
          <Card key={p.id} className="trip-card-shadow">
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <p className="font-semibold text-foreground">{p.nome}</p>
                <p className="text-sm text-muted-foreground">{p.destino}</p>
              </div>
              <Button size="sm" onClick={() => alert(`Booking de ${p.nome} confirmado`)}>
                Confirmar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
