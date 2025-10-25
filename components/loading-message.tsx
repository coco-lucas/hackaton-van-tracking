import { Loader2 } from "lucide-react"

export const LoadingMessage = ({ message, customText }: { message?: string, customText?: string }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
      <p className="text-lg text-primary flex items-center">
        {customText ? customText : (
          <>
            Carregando {message}
          </>
        )}
        <span className="ml-2 inline-flex items-center space-x-1" aria-hidden="true">
          <span className="inline-block animate-pulse" style={{ animationDelay: '0s' }}>.</span>
          <span className="inline-block animate-pulse" style={{ animationDelay: '200ms' }}>.</span>
          <span className="inline-block animate-pulse" style={{ animationDelay: '400ms' }}>.</span>
        </span>
      </p>
    </div>
  )
}