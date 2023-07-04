export default defineEventHandler(async (event) => {
  const { album, image } = event.context.params as {
    album: string;
    image: string;
  };

  // take åäö into account
  const albumName = album
    .replace(/%C3%A5/g, "å")
    .replace(/%C3%A4/g, "ä")
    .replace(/%C3%B6/g, "ö");

  // Fetch the image from the CDN
  const imageUrl = `https://cdn.fredrik.studio/${albumName}/${image}`;

  console.log(imageUrl);
  const response = await fetch(imageUrl);
  const imageBuffer = await response.arrayBuffer();

  // Return the image buffer as the response
  return Buffer.from(imageBuffer);
});
