import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Smartphone, User, Loader2, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface ReportItem {
    id: string;
    name: string;
    phone: string;
    status: "sent" | "failed" | "pending";
    timestamp: string;
}

export function SendStatusSidebar() {
    const { data: reportData, isLoading, refetch, isRefetching } = useQuery<ReportItem[]>({
        queryKey: ["/api/last-send-report"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/last-send-report");
            return res.json();
        },
        refetchOnWindowFocus: true,
    });

    const report = reportData || [];
    const total = report.length;
    const sent = report.filter((c) => c.status === "sent").length;
    const failed = report.filter((c) => c.status === "failed").length;

    return (
        <Sheet onOpenChange={(open) => {
            if (open) {
                refetch();
            }
        }}>
            <SheetTrigger asChild>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative group">
                    <Clock className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    <span className="sr-only">آخر عملية إرسال</span>
                    {total > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r border-gray-200/50 flex flex-col h-full">
                <SheetHeader className="text-right pb-4 border-b border-gray-100 flex-none">
                    <SheetTitle className="text-2xl font-bold bg-gradient-to-l from-primary to-blue-600 bg-clip-text text-transparent">
                        تقرير آخر إرسال
                    </SheetTitle>
                    <SheetDescription className="text-right flex items-center justify-end gap-2">
                        تم التحديث قبل قليل
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetch()} disabled={isLoading || isRefetching}>
                            <RefreshCw className={`w-3 h-3 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>جاري تحميل البيانات...</p>
                    </div>
                ) : total === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center p-4">
                        <Clock className="h-12 w-12 mb-4 opacity-20" />
                        <p>لا يوجد تقارير سابقة</p>
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-3 gap-2 py-4 flex-none">
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                                <span className="block text-xl font-bold text-green-600 dark:text-green-400">{sent}</span>
                                <span className="text-xs text-green-700 dark:text-green-300">تم الإرسال</span>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
                                <span className="block text-xl font-bold text-red-600 dark:text-red-400">{failed}</span>
                                <span className="text-xs text-red-700 dark:text-red-300">فشل</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg text-center">
                                <span className="block text-xl font-bold text-gray-600 dark:text-gray-400">{total}</span>
                                <span className="text-xs text-gray-700 dark:text-gray-300">الكلي</span>
                            </div>
                        </div>

                        <Separator className="my-2 flex-none" />

                        {/* Client List */}
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-3 py-2">
                                {report.map((client) => (
                                    <div
                                        key={client.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100/50 dark:border-gray-700/50"
                                    >
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge
                                                variant="outline"
                                                className={`
                          text-xs px-2 py-0.5 border-0
                          ${client.status === "sent"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : client.status === "failed"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    }
                        `}
                                            >
                                                {client.status === "sent" ? "تم" : client.status === "failed" ? "فشل" : "جاري"}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                    {client.name}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <span dir="ltr">{client.phone}</span>
                                                    <Smartphone className="w-3 h-3" />
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
