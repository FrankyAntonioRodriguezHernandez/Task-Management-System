export function useDark() {
  const isDark = useState('isDark', () => false)

  useHead(() => ({
    htmlAttrs: { class: isDark.value ? 'dark' : undefined }
  }))

  const toggle = () => (isDark.value = !isDark.value)
  return { isDark, toggle }
}
