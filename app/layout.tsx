import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TranspJardim - Sistema de Transparência Municipal',
  description: 'Plataforma de transparência, eficiência e monitoramento de critérios para gestão pública municipal de Jardim/CE',
  keywords: ['transparência', 'gestão pública', 'jardim', 'ceará', 'prefeitura', 'monitoramento'],
  authors: [{ name: 'Controladoria Municipal de Jardim/CE' }],
  creator: 'Prefeitura Municipal de Jardim/CE',
  publisher: 'Prefeitura Municipal de Jardim/CE',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://transpjardim.jardim.ce.gov.br'),
  openGraph: {
    title: 'TranspJardim - Transparência Municipal',
    description: 'Sistema de monitoramento e transparência da gestão pública municipal de Jardim/CE',
    url: 'https://transpjardim.jardim.ce.gov.br',
    siteName: 'TranspJardim',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'adicionar-google-site-verification-quando-necessario',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4a7c59" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}