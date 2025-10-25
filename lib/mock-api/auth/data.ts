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
    nome: "Prof. João Oliveira",
    cpf: "111.444.777-35", // Valid CPF for testing
    telefone: "(21) 99999-1111",
    role: "passageiro",
    matricula: "PROF-001",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
  },
  {
    id: "passenger-2",
    nome: "Profa. Ana Paula",
    cpf: "222.555.888-69", // Valid CPF for testing
    telefone: "(21) 99999-2222",
    role: "passageiro",
    matricula: "PROF-002",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
  },
  {
    id: "passenger-3",
    nome: "Prof. Roberto Costa",
    cpf: "333.666.999-03", // Valid CPF for testing
    telefone: "(21) 99999-3333",
    role: "passageiro",
    matricula: "PROF-003",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
  },
  {
    id: "passenger-4",
    nome: "Profa. Mariana Lima",
    cpf: "444.777.000-37", // Valid CPF for testing
    telefone: "(21) 99999-4444",
    role: "passageiro",
    matricula: "PROF-004",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
  },
  {
    id: "passenger-5",
    nome: "Prof. Fernando Alves",
    cpf: "555.888.111-71", // Valid CPF for testing
    telefone: "(21) 99999-5555",
    role: "passageiro",
    matricula: "PROF-005",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernando",
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
