import Navigation from "../src/components/Navigation";

export const metadata = {
  title: 'My App2',
  description: 'Room Booking App'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}