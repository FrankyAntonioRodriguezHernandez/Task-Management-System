import axios from 'axios'

export const useApi = () => {
  const config = useRuntimeConfig()
  return axios.create({
    baseURL: config.public.apiBase,
    headers: { 'Content-Type': 'application/json' }
  })
}
