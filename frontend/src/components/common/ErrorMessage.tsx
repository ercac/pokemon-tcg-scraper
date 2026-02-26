interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 max-w-md text-center">
        <p className="text-red-700 font-medium">Something went wrong</p>
        <p className="text-red-600 text-sm mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
