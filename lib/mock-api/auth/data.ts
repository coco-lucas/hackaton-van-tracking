// Mock Authentication Data
// Contains test users for drivers, passengers, and admin

import type { User, Driver, Passenger } from "@/lib/types";

// Mock Drivers
export const mockDrivers: Driver[] = [
  {
    id: "driver-1",
    nome: "Carlos Silva",
    cpf: "123.456.789-09", // Valid CPF for testing
    telefone: "(21) 98765-4321",
    role: "motorista",
    cnh: "12345678901",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    veiculo: {
      id: "vehicle-1",
      placa: "ABC-1234",
      modelo: "Sprinter",
      cor: "Branca",
      capacidade: 15,
      ano: 2020,
    },
  },
  {
    id: "driver-2",
    nome: "Maria Santos",
    cpf: "987.654.321-00", // Valid CPF for testing
    telefone: "(21) 98765-5555",
    role: "motorista",
    cnh: "98765432109",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    veiculo: {
      id: "vehicle-2",
      placa: "XYZ-5678",
      modelo: "Master",
      cor: "Prata",
      capacidade: 12,
      ano: 2021,
    },
  },
];

// Mock Passengers (Professors)
export const mockPassengers: Passenger[] = [
  {
    id: "passenger-1",
    nome: "Prof. João Pedro Oliveira",
    cpf: "111.444.777-35", // Valid CPF for testing
    telefone: "(21) 98745-1122",
    role: "passageiro",
    matricula: "PROF-2024-001",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=JoaoPedro",
  },
  {
    id: "passenger-2",
    nome: "Profa. Ana Paula Rodrigues",
    cpf: "222.555.888-69", // Valid CPF for testing
    telefone: "(21) 99876-3344",
    role: "passageiro",
    matricula: "PROF-2024-002",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnaPaula",
  },
  {
    id: "passenger-3",
    nome: "Prof. Roberto Costa Silva",
    cpf: "333.666.999-03", // Valid CPF for testing
    telefone: "(21) 97654-5566",
    role: "passageiro",
    matricula: "PROF-2023-015",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=RobertoCosta",
  },
  {
    id: "passenger-4",
    nome: "Profa. Mariana Santos Lima",
    cpf: "444.777.000-37", // Valid CPF for testing
    telefone: "(21) 96543-7788",
    role: "passageiro",
    matricula: "PROF-2023-028",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=MarianaSantos",
  },
  {
    id: "passenger-5",
    nome: "Prof. Fernando de Almeida",
    cpf: "555.888.111-71", // Valid CPF for testing
    telefone: "(21) 95432-9900",
    role: "passageiro",
    matricula: "PROF-2022-042",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=FernandoAlmeida",
  },
  {
    id: "passenger-6",
    nome: "Profa. Beatriz Ferreira",
    cpf: "666.999.222-05", // Valid CPF for testing
    telefone: "(21) 94321-1234",
    role: "passageiro",
    matricula: "PROF-2024-007",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=BeatrizFerreira",
  },
  {
    id: "passenger-7",
    nome: "Prof. Carlos Eduardo Souza",
    cpf: "777.000.333-39", // Valid CPF for testing
    telefone: "(21) 93210-5678",
    role: "passageiro",
    matricula: "PROF-2023-033",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosEduardo",
  },
  {
    id: "passenger-8",
    nome: "Profa. Diana Mendes",
    cpf: "888.111.444-73", // Valid CPF for testing
    telefone: "(21) 92109-8765",
    role: "passageiro",
    matricula: "PROF-2024-012",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=DianaMendes",
  },
];

// Mock Admin
export const mockAdmin: User = {
  id: "admin-1",
  nome: "Administrador Sistema",
  cpf: "000.000.001-91", // Valid CPF for testing
  telefone: "(21) 99999-0000",
  role: "admin",
  foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
};

// All users combined for easy lookup
export const allMockUsers: User[] = [
  ...mockDrivers,
  ...mockPassengers,
  mockAdmin,
];

// Default passwords for all mock users (in production, these would be hashed)
export const MOCK_PASSWORD = "123456";

/**
 * Find user by CPF
 * Accepts both formatted (000.000.000-00) and unformatted (00000000000) CPF
 */
export const findUserByCpf = (cpf: string): User | undefined => {
  // Clean CPF (remove formatting)
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  return allMockUsers.find((user) => {
    const userCleanCPF = user.cpf.replace(/[^\d]/g, '');
    return userCleanCPF === cleanCPF;
  });
};

/**
 * Validate mock credentials
 */
export const validateCredentials = (
  cpf: string,
  password: string
): User | null => {
  const user = findUserByCpf(cpf);

  if (!user) return null;

  // In a real app, you'd compare hashed passwords
  if (password === MOCK_PASSWORD) {
    return user;
  }

  return null;
};
