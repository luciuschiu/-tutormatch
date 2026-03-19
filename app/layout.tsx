import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "TutorMatch SG — Find Your Perfect Tutor",
  description: "Singapore's chillest way to connect O-Level and A-Level students with compatible tutors. Smart matching, real-time chat, and seamless booking.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TutorMatch',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <meta name="theme-color" content="#FFF8F0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ background: '#FFF8F0', color: '#2C1810' }}>{children}</body>
    </html>
  );
}
