import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TutorMatch SG — Find Your Perfect Tutor",
  description: "Singapore's smartest way to connect O-Level and A-Level students with compatible tutors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}