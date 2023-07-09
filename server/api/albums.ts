type Item = {
  name: string;
  type: string;
};

type ReturnType = string[] | null;

export default defineEventHandler(async (event): Promise<ReturnType> => {
  const { album } = getQuery(event) as { album: string };

  const url = `https://cdn.fredrik.studio/albums/${album}/`;

  try {
    const response = await fetch(url);

    const json = await response.json();

    const imageLinks = json
      .filter((item: Item) => item.type === "file")
      .map((item: Item) => item.name) as string[];

    // Sort images by name make sure the order is correct
    imageLinks.sort((a: string, b: string) => {
      const aNumber = parseInt(a.split(".")[0]);
      const bNumber = parseInt(b.split(".")[0]);

      return bNumber - aNumber;
    });

    return imageLinks;
  } catch (error) {
    throw new Error("Error fetching images");
  }
});
