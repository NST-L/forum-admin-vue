// src/services/login.js
import apiClient from './http';

export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};