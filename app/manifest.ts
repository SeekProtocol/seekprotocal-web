import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Seek Protocol",
    short_name: "SeekProtocol",
    description:
      "The first AR and AI platform on Solana - Redefining Innovation",
    start_url: "/",
    display: "standalone",
    background_color: "#000206",
    theme_color: "#5d74f9",
    icons: [
      {
        src: "/images/favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/images/webclip.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  };
}
