type ReturnType = string[] | null;

export default defineEventHandler(async (event): Promise<ReturnType> => {
  const url = `https://cdn.fredrik.studio/albums`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    const albums = json.map((item: any) => {
      if (item.type === "directory") {
        return item.name;
      }
    });

    return albums;
  } catch (error) {
    throw new Error("Error fetching images");
  }
});
