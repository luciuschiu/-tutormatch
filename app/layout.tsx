import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TutorMatch SG — Find Your Perfect Tutor",
  description: "Singapore's chillest way to connect O-Level and A-Level students with compatible tutors. Smart matching, real-time chat, and seamless booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body style={{ background: '#FFF8F0', color: '#2C1810' }}>{children}</body>
    </html>
  );
}
