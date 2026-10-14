import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'PADO Studio — 오래 남는 디지털 경험', description: '브랜드의 첫인상부터 디지털 제품까지. PADO Studio의 디자인 콘셉트와 프로젝트 브리프.' };
export default function Layout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ko"><body>{children}</body></html>; }
