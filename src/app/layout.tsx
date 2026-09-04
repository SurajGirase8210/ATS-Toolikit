import './globals.css';import Navbar from '@/components/layout/Navbar';import Footer from '@/components/layout/Footer';import dynamic from 'next/dynamic';import {Toaster} from 'react-hot-toast';
const CopilotChat=dynamic(()=>import('@/components/layout/CopilotChat'),{ssr:false});
export const metadata={title:'AI Career Copilot | Truth-safe resume and job optimization',description:'Analyze jobs, optimize resumes safely, prepare for interviews and track applications.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Navbar/><main>{children}</main><Footer/><CopilotChat/><Toaster position="top-right"/></body></html>}
