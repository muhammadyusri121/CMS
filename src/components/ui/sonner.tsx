import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <>
      <style>{`
        [data-sonner-toast][data-type='success'] {
          background-color: #10b981 !important;
          color: #fff !important;
        }
        [data-sonner-toast][data-type='error'] {
          background-color: #ef4444 !important;
          color: #fff !important;
        }
        [data-sonner-toast][data-type='warning'] {
          background-color: #f59e0b !important;
          color: #fff !important;
        }
        [data-sonner-toast][data-type='info'] {
          background-color: #3b82f6 !important;
          color: #fff !important;
        }
        [data-sonner-toast][data-type] [data-icon], 
        [data-sonner-toast][data-type] [data-title], 
        [data-sonner-toast][data-type] [data-description] {
          color: #fff !important;
        }
        [data-sonner-toast] [data-close-button] {
          display: none !important;
        }
      `}</style>
      <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors
      expand={true}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        className: "font-sans",
        style: {
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          border: 'none',
        },
      }}
      {...props}
    />
    </>
  )
}

export { Toaster }
