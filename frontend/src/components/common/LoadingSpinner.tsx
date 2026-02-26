export default function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600" />
    </div>
  )
}
