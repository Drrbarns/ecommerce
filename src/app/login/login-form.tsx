'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import ReCAPTCHA from "react-google-recaptcha"
import { verifyRecaptcha } from "@/lib/actions/security-actions"

interface LoginFormProps {
    recaptchaSiteKey?: string
}

export function LoginForm({ recaptchaSiteKey }: LoginFormProps) {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const recaptchaRef = useRef<ReCAPTCHA>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Verify Captcha if enabled
            if (recaptchaSiteKey) {
                const token = recaptchaRef.current?.getValue();

                if (!token) {
                    toast.error("Please complete the security check")
                    setIsLoading(false)
                    return
                }

                const verifyResult = await verifyRecaptcha(token)
                if (!verifyResult.success) {
                    toast.error(verifyResult.error || "Security check failed")
                    recaptchaRef.current?.reset()
                    setIsLoading(false)
                    return
                }
            }

            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(error.message)
                recaptchaRef.current?.reset() // Reset captcha on auth error too
                setIsLoading(false)
            } else {
                toast.success('Logged in successfully')
                router.refresh()
                router.push('/admin')
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access the dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {recaptchaSiteKey && (
                            <div className="flex justify-center py-2">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={recaptchaSiteKey}
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
