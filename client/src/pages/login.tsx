import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Scene3D } from "@/components/scene-3d";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await apiRequest("POST", "/api/login", { username, password });
            const data = await res.json();

            if (data.token) {
                localStorage.setItem("auth_token", data.token);
            }

            toast({
                title: "تم تسجيل الدخول بنجاح",
                description: "مرحباً بك مرة أخرى",
            });

            // Invalidate auth query to update ProtectedRoute state
            await queryClient.invalidateQueries({ queryKey: ["/api/check-auth"] });

            // Client-side navigation to avoid page reload and white flash
            setLocation("/");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast({
                variant: "destructive",
                title: "فشل تسجيل الدخول",
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 font-['Cairo'] relative z-10 overflow-hidden">
            <Card className="w-full max-w-md glass-card border-0 shadow-2xl">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain drop-shadow-md" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white cursor-default select-none">
                        تسجيل الدخول
                    </CardTitle>
                    <p className="text-sm text-muted-foreground cursor-default select-none">
                        الرجاء إدخال بيانات الدخول للمتابعة
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-default select-none">
                                اسم المستخدم
                            </label>
                            <Input
                                type="text"
                                placeholder="اسم المستخدم"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-white/50 dark:bg-slate-900/50"
                                dir="rtl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-default select-none">
                                كلمة المرور
                            </label>
                            <Input
                                type="password"
                                placeholder="كلمة المرور"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/50 dark:bg-slate-900/50"
                                dir="rtl"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#6AC1E8] hover:bg-[#5AB1D8] text-white mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? "جاري التحقق..." : "دخول"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
