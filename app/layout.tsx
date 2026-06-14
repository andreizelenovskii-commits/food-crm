import type { Metadata } from "next";
import { BodyScrollLockObserver } from "@/components/ui/body-scroll-lock-observer";
import { BUILD_VERSION } from "@/shared/build-version";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodLike | Доставка еды",
  description: "FoodLike: пицца, роллы, горячие блюда, акции и удобная доставка.",
  icons: {
    icon: [
      {
        url: "/foodlike-app-icon-v3.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/foodlike-app-icon-v3.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <head>
        <meta name="foodlike-build" content={BUILD_VERSION} />
      </head>
      <body className="min-h-full flex flex-col">
        <BodyScrollLockObserver />
        {children}
      </body>
    </html>
  );
}
