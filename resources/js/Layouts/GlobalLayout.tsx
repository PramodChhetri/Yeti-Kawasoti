import { ThemeProvider } from '@/Components/ThemeProvider'
import { Toaster } from '@/Components/ui/toaster'
import { ReactNode } from 'react'

const GlobalLayout = ({ children }: { children: ReactNode }) => {
    return (
        <ThemeProvider
            attribute="class"
            enableSystem={true}
            disableTransitionOnChange
        >
            {children}
            <Toaster />
        </ThemeProvider>
    )
}

export default GlobalLayout