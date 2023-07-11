import sizeOf from "image-size";
import { ReturnType } from "../../types";

type Item = {
  name: string;
  type: string;
};

export default defineCachedEventHandler(
  async (event): Promise<ReturnType> => {
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

      // For each image, get the width and height with sharp
      let images = await Promise.all(
        imageLinks.map(async (imageLink: string) => {
          const url = `https://cdn.fredrik.studio/albums/${album}/${imageLink}`;

          // Fetch the buffer and get the width and height
          try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer); // Convert the ArrayBuffer to a Buffer
            const dimensions = sizeOf(buffer);

            return {
              name: imageLink,
              width: dimensions.width,
              height: dimensions.height,
            };
          } catch (e) {
            // @ts-ignore
            console.log(e.message);
            return null;
          }
        })
      );

      return images.filter((image) => image !== null) as ReturnType
    } catch (error) {
      throw new Error("Error fetching images" + error);
    }
  },
  {
    staleMaxAge: 60 * 60 * 24, // 1 day
    maxAge: 60 * 60 * 24, // 1 day
    swr: true,
  }
);
