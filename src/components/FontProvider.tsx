import { createContext, useContext, useEffect, useState } from "react"

type FontFamily = "inter" | "roboto" | "poppins" | "montserrat" | "lato" | "opensans" | "nunito" | "raleway" | "sourcesans" | "playfair"

type FontProviderProps = {
  children: React.ReactNode
  defaultFont?: FontFamily
  storageKey?: string
}

type FontProviderState = {
  font: FontFamily
  setFont: (font: FontFamily) => void
}

const initialState: FontProviderState = {
  font: "inter",
  setFont: () => null,
}

const FontProviderContext = createContext<FontProviderState>(initialState)

export function FontProvider({
  children,
  defaultFont = "inter",
  storageKey = "hardware-store-font",
  ...props
}: FontProviderProps) {
  const [font, setFont] = useState<FontFamily>(
    () => (localStorage.getItem(storageKey) as FontFamily) || defaultFont
  )

  useEffect(() => {
    const root = window.document.documentElement
    const body = window.document.body

    // Remove all font classes from both root and body
    const fontClasses = ["font-inter", "font-roboto", "font-poppins", "font-montserrat", "font-lato", "font-opensans", "font-nunito", "font-raleway", "font-sourcesans", "font-playfair"]
    
    root.classList.remove(...fontClasses)
    body.classList.remove(...fontClasses)

    // Add the selected font class to body for global application
    body.classList.add(`font-${font}`)
    
    // Also update CSS custom property for font family
    root.style.setProperty('--font-family', `var(--font-${font})`)
  }, [font])

  const value = {
    font,
    setFont: (font: FontFamily) => {
      localStorage.setItem(storageKey, font)
      setFont(font)
    },
  }

  return (
    <FontProviderContext.Provider {...props} value={value}>
      {children}
    </FontProviderContext.Provider>
  )
}

export const useFont = () => {
  const context = useContext(FontProviderContext)

  if (context === undefined)
    throw new Error("useFont must be used within a FontProvider")

  return context
}

export const fontOptions = [
  { value: "inter", label: "Inter", description: "Modern and clean" },
  { value: "roboto", label: "Roboto", description: "Google's signature font" },
  { value: "poppins", label: "Poppins", description: "Geometric and friendly" },
  { value: "montserrat", label: "Montserrat", description: "Urban and stylish" },
  { value: "lato", label: "Lato", description: "Professional and warm" },
  { value: "opensans", label: "Open Sans", description: "Humanist and readable" },
  { value: "nunito", label: "Nunito", description: "Rounded and gentle" },
  { value: "raleway", label: "Raleway", description: "Elegant and sophisticated" },
  { value: "sourcesans", label: "Source Sans Pro", description: "Adobe's clean design" },
  { value: "playfair", label: "Playfair Display", description: "Classic and editorial" },
] as const