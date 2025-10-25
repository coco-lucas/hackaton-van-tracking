// Mock Authentication Service
// Handles login, logout, and session management with simulated delays

import { validateCredentials, findUserByCpf } from "./data";
import {
  simulateDelay,
  createSuccessResponse,
  createErrorResponse,
  simulateError,
  type ApiResponse,
} from "../config";
import type { AuthCredentials, AuthResponse, User } from "@/lib/types";

/**
 * Mock login function
 * Simulates API authentication with delay
 */
export const login = async (
  credentials: AuthCredentials
): Promise<ApiResponse<AuthResponse>> => {
  // Simulate network delay
  await simulateDelay("fast");

  // Simulate random errors (if enabled in config)
  if (simulateError()) {
    return createErrorResponse(
      "Erro de conexão. Tente novamente.",
      "NETWORK_ERROR"
    );
  }

  // Validate credentials
  const user = validateCredentials(credentials.cpf, credentials.senha);

  if (!user) {
    return createErrorResponse("CPF ou senha inválidos", "INVALID_CREDENTIALS");
  }

  // Role is auto-detected from user data (no need to check credentials.role)
  // The user's role from the database determines their access level

  // Generate mock token (in production, this would be a JWT)
  const token = `mock_token_${user.id}_${Date.now()}`;

  return createSuccessResponse<AuthResponse>({
    user,
    token,
  });
};

/**
 * Mock logout function
 */
export const logout = async (): Promise<ApiResponse<{ message: string }>> => {
  await simulateDelay("fast");

  return createSuccessResponse({ message: "Logout realizado com sucesso" });
};

/**
 * Verify token and get current user
 * In a real app, this would validate a JWT token
 */
export const getCurrentUser = async (
  token: string
): Promise<ApiResponse<User>> => {
  await simulateDelay("fast");

  // Extract user ID from mock token
  const match = token.match(/mock_token_([^_]+)_/);
  if (!match) {
    return createErrorResponse("Token inválido", "INVALID_TOKEN");
  }

  const userId = match[1];

  // Find user by ID (in a real app, this would decode the JWT)
  const users = await import("./data");
  const user = users.allMockUsers.find((u) => u.id === userId);

  if (!user) {
    return createErrorResponse("Usuário não encontrado", "USER_NOT_FOUND");
  }

  return createSuccessResponse(user);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("auth_token");
  return !!token;
};

/**
 * Get stored auth data from localStorage
 */
export const getStoredAuth = (): { user: User; token: string } | null => {
  if (typeof window === "undefined") return null;

  try {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (!token || !userData) return null;

    const user = JSON.parse(userData) as User;

    return { user, token };
  } catch (error) {
    console.error("Erro ao recuperar dados de autenticação:", error);
    return null;
  }
};

/**
 * Store auth data in localStorage
 */
export const storeAuth = (user: User, token: string): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem("auth_token", token);
  localStorage.setItem("user_data", JSON.stringify(user));
};

/**
 * Clear auth data from localStorage
 */
export const clearAuth = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_data");
};
