import { redirect } from 'next/navigation'
import { checkSalesAccess } from '@/lib/auth/salesAccess'

export default async function PicturesLayout({ children }: { children: React.ReactNode }) {
  const salesAccess = await checkSalesAccess()
  if (!salesAccess.isSalesUser) {
    redirect('/dashboard')
  }
  return <>{children}</>
}
