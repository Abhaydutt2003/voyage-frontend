import { NextRequest } from "next/server";
import { getPropertyLight } from "@/lib/getPropertyLight";

//this is a hacky solution to make sure that the bots can scrape to see the peoperty information, but at the same time real users get redirected to the actual property.(aws amplify does not work with generateMetadata.)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const meta = await getPropertyLight(id);
  const name = meta?.name ?? "Property Listing";
  const description =
    meta?.description ?? "Voyage | find your perfect property";
  const image = meta?.photoUrlsBaseKeys?.[0] ?? "/default-property.jpg";
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/search/${id}`;

  // Always return HTML with meta tags, but redirect users immediately
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${name}</title>
      <meta name="description" content="${description}" />
      <!-- Open Graph -->
      <meta property="og:title" content="${name}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${url}" />
      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${name}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${image}" />
      
      <!-- Meta refresh as fallback -->
      <meta http-equiv="refresh" content="0;url=${url}" />
    </head>
    <body>
      <h1>${name}</h1>
      <p>Redirecting to property...</p>
      <script>
        // Immediate redirect for users with JavaScript
        window.location.replace('${url}');
      </script>
      <noscript>
        <a href="${url}">Click here if you are not redirected automatically</a>
      </noscript>
    </body>
    </html>
  `;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
