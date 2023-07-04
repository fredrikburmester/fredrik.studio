type Item = {
  name: string
  type: string
}

type ReturnType = string[]

export default defineEventHandler(async (event): Promise<ReturnType> => {
  const { album } = getQuery(event) as { album: string }

  // const albumName = album.replace('ö', '%C3%B6').replace('ä', '%C3%A4').replace('å', '%C3%A5')
  const url = `https://cdn.fredrik.studio/albums/${album}/`

  console.log({url})

  try {
    const response = await fetch(url)

    console.log({
      response: response.status,
      responseText: response.statusText,
    })

    const json = await response.json()
    console.log(json)

    const imageLinks = json.filter((item: Item) => item.type === 'file').map((item: Item) => item.name) as string[]

    // Sort images by name make sure the order is correct
    imageLinks.sort((a: string, b: string) => {
      const aNumber = parseInt(a.split('.')[0])
      const bNumber = parseInt(b.split('.')[0])
      
      return bNumber - aNumber
    })

    return imageLinks
  } catch (error) {
    console.error(error)
    return []
  }
})
