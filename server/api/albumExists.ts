type ReturnType = boolean | null;

export default defineEventHandler(async (event): Promise<ReturnType> => {
  const { album } = getQuery(event) as { album: string };

  const url = `https://cdn.fredrik.studio/albums`;

  try {
    const response = await fetch(url);

    const json = await response.json();

    const albumExists = json.some((item: any) => {
      if (item.name === album && item.type === "directory") {
        return item;
      }
    });

    return albumExists;
  } catch (error) {
    throw new Error("Error fetching images");
  }
});
