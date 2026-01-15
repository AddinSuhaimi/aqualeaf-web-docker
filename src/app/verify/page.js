import { Suspense } from 'react'
import VerifyClient from './VerifyClient'

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700">Loading...</div>
      </div>
    }>
      <VerifyClient />
    </Suspense>
  )
}
