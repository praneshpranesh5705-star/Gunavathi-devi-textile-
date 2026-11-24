/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: `output: "export"` was removed deliberately.
  //
  // A static export produces HTML with no server, which is why the old
  // `next start` script could never work and why the admin panel had nowhere
  // to save except the browser's localStorage. A CMS needs a server to hold
  // the session cookie, run the write operations, and render the catalogue
  // from the database. Removing the flag also fixes `npm start`.
  images: {
    remotePatterns: [
      // Product photos uploaded to Supabase Storage.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // The original placeholder photos, kept so existing rows still render.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
