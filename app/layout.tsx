import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'swell · Next.js demo', description: 'swell 배포 테스트용 Next.js 앱' };
export default function Layout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ko"><body>{children}</body></html>; }
