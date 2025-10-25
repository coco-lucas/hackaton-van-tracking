// Type definitions for the Van Tracking application

export type UserRole = "motorista" | "passageiro" | "admin";

export type TripStatus =
  | "agendada"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export interface User {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  role: UserRole;
  foto?: string;
  matricula?: string; // For professors
  cnh?: string; // For drivers
}

export interface Driver extends User {
  role: "motorista";
  cnh: string;
  veiculo: Vehicle;
}

export interface Passenger extends User {
  role: "passageiro";
  matricula: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
  capacidade: number;
  ano: number;
}

export interface Location {
  lat: number;
  lng: number;
  endereco: string;
  cidade: string;
}

export interface Trip {
  id: string;
  motorista: Driver;
  origem: Location;
  destino: Location;
  dataHoraSaida: string; // ISO string
  dataHoraChegadaPrevista: string; // ISO string
  status: TripStatus;
  passageiros: Passenger[];
  vagasDisponiveis: number;
  capacidadeTotal: number;
  rota?: {
    distancia: string; // "45 km"
    duracao: string; // "1h 20min"
  };
}

export interface TripWithLocation extends Trip {
  localizacaoAtual?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  tempoEstimadoChegada?: string;
}

export interface Message {
  id: string;
  remetenteId: string;
  destinatarioId: string;
  viagemId: string;
  conteudo: string;
  dataHora: string;
  lida: boolean;
  tipo: "usuario" | "sistema";
}

export interface AuthCredentials {
  cpf: string;
  senha: string;
  role?: UserRole; // Optional - will be auto-detected from database
}

export interface AuthResponse {
  user: User;
  token: string;
}
