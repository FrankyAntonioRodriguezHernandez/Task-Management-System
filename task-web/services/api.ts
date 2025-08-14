import axios from 'axios'
import { useRuntimeConfig } from 'nuxt/app'

export function useApi() {
  const config = useRuntimeConfig()
  return axios.create({
    baseURL: config.public.apiBase || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3333',
    headers: { 'Content-Type': 'application/json' },
  })
}
