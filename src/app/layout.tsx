import './globals.css';
import type { Metadata } from 'next';import Navbar from '@/components/layout/Navbar';import Footer from '@/components/layout/Footer';import dynamic from 'next/dynamic';import {Toaster} from 'react-hot-toast';
const CopilotChat=dynamic(()=>import('@/components/layout/CopilotChat'),{ssr:false});
export const metadata: Metadata = {
  metadataBase: new URL('https://ats-toolikit.vercel.app'),
  title: {
    default: 'AI Career Copilot | ATS Resume Checker & Job Search Copilot',
    template: '%s | AI Career Copilot',
  },
  description: 'Analyze job descriptions, check ATS resume match, find skill gaps, optimize resumes with evidence, prepare for interviews, and track applications.',
  keywords: [
    'AI resume builder', 'ATS resume checker', 'ATS resume score', 'resume optimizer',
    'resume job match', 'job description resume match', 'AI interview preparation',
    'resume builder for freshers', 'career copilot', 'job application tracker'
  ],
  applicationName: 'AI Career Copilot',
  authors: [{ name: 'AI Career Copilot' }],
  creator: 'AI Career Copilot',
  publisher: 'AI Career Copilot',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: {
    type: 'website',
    url: 'https://ats-toolikit.vercel.app/',
    siteName: 'AI Career Copilot',
    title: 'AI Career Copilot | ATS Resume Checker & Job Search Copilot',
    description: 'Match your resume to jobs, identify skill gaps, optimize safely, prepare for interviews, and track applications.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Career Copilot | ATS Resume Checker & Job Search Copilot',
    description: 'Evidence-backed resume optimization and job search tools for students, freshers, and professionals.',
  },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Navbar/><main>{children}</main><Footer/><CopilotChat/><Toaster position="top-right"/></body></html>}
