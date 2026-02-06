import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // if you have one
import SidebarShell from "@/components/SidebarShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SidebarShell>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <Footer />
        </SidebarShell>
      </body>
    </html>
  );
}
