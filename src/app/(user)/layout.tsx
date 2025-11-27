
import Navbar from "@/context/Navbar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
        <div>
          <Navbar/>
          {/* <CartProvider> */}
          {children}
        </div>
      
  );
}
