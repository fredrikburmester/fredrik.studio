export const useLightbox = () => {
  const image = ref('')

  const close = () => {
    image.value = ''
  }

  const open = (i: string) => {
    image.value = i
  }

  return {
    open,
    close
  }
}