import './globals.css'

export const metadata = {
  title: 'Life Dashboard',
  description: 'Your personal dashboard for calendar, todos, and groceries',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
