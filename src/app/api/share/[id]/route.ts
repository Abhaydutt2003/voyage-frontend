import { NextRequest } from "next/server";
import { getPropertyLight } from "@/state/api/getPropertyLight";

//this is a hacky solution to make sure that the bots can scrape to see the peoperty information, but at the same time real users get redirected to the actual property.(aws amplify does not work with generateMetadata.)
export async function GET(req: NextRequest) {
  // Extract the id from the URL
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // gets the [id] from the path

  const meta = await getPropertyLight(id!);
  const name = meta?.name ?? "Property Listing";
  const description =
    meta?.description ?? "Voyage | find your perfect property";
  const image = meta?.photoUrlsBaseKeys?.[0] ?? "/default-property.jpg";
  const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/search/${id}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en"></html>
    <head>
      <meta charset="utf-8" />
      <title>${name}</title>
      <meta name="description" content="${description}" />
      <!-- Open Graph -->
      <meta property="og:title" content="${name}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${propertyUrl}" />
      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${name}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${image}" />
      <meta http-equiv="refresh" content="0;url=${propertyUrl}" />
    </head>
    <body>
      <h1>${name}</h1>
      <p>Redirecting to property...</p>
      <script>
        window.location.replace('${propertyUrl}');
      </script>
      <noscript>
        <a href="${propertyUrl}">Click here if you are not redirected automatically</a>
      </noscript>
    </body>
    </html>
  `;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
