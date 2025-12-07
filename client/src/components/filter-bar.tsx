import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface FilterBarProps {
    neighborhoods: string[];
    statuses: string[];
    onFilterChange: (filters: {
        neighborhoods: string[];
        statuses: string[];
        dateRange: DateRange | undefined;
    }) => void;
}

export function FilterBar({
    neighborhoods,
    statuses,
    onFilterChange,
}: FilterBarProps) {
    const [openNeighborhood, setOpenNeighborhood] = useState(false);
    const [openStatus, setOpenStatus] = useState(false);
    const [openDate, setOpenDate] = useState(false);

    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const toggleSelection = (
        current: string[],
        setFn: (val: string[]) => void,
        item: string
    ) => {
        const newSelection = current.includes(item)
            ? current.filter((i) => i !== item)
            : [...current, item];
        setFn(newSelection);
        onFilterChange({
            neighborhoods: current === selectedNeighborhoods ? newSelection : selectedNeighborhoods,
            statuses: current === selectedStatuses ? newSelection : selectedStatuses,
            dateRange,
        });
    };

    const setDateRangeAndNotify = (range: DateRange | undefined) => {
        setDateRange(range);
        onFilterChange({
            neighborhoods: selectedNeighborhoods,
            statuses: selectedStatuses,
            dateRange: range,
        });
    };

    const clearFilters = () => {
        setSelectedNeighborhoods([]);
        setSelectedStatuses([]);
        setDateRange(undefined);
        onFilterChange({
            neighborhoods: [],
            statuses: [],
            dateRange: undefined,
        });
    };

    return (
        <div className="flex flex-col gap-6 w-full font-['Cairo']">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Filter className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg cursor-default select-none">تصفية البيانات</span>
                </div>

                {(selectedNeighborhoods.length > 0 || selectedStatuses.length > 0 || dateRange) && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full px-4"
                    >
                        مسح التصفية
                        <X className="mr-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                {/* Neighborhood Filter */}
                <Popover open={openNeighborhood} onOpenChange={setOpenNeighborhood}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openNeighborhood}
                            className="justify-between min-w-[240px] h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:border-primary hover:ring-2 hover:ring-primary/10 transition-all duration-300 bg-card text-foreground shadow-sm"
                        >
                            <span className="truncate text-base">
                                {selectedNeighborhoods.length === 0
                                    ? "عنوان العميل الكامل"
                                    : `${selectedNeighborhoods.length} محدد`}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0 font-['Cairo'] bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
                        <Command className="rounded-xl">
                            <CommandInput placeholder="بحث عن حي..." className="h-11 text-right" />
                            <CommandList className="max-h-[200px] custom-scrollbar">
                                <CommandEmpty className="py-4 text-center text-muted-foreground">لا توجد نتائج.</CommandEmpty>
                                <CommandGroup>
                                    {neighborhoods.map((neighborhood) => (
                                        <CommandItem
                                            key={neighborhood}
                                            value={neighborhood}
                                            onSelect={() => toggleSelection(selectedNeighborhoods, setSelectedNeighborhoods, neighborhood)}
                                            className="cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary py-2.5"
                                        >
                                            <div className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                selectedNeighborhoods.includes(neighborhood)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}>
                                                <Check className={cn("h-3 w-3")} />
                                            </div>
                                            {neighborhood}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Status Filter */}
                <Popover open={openStatus} onOpenChange={setOpenStatus}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openStatus}
                            className="justify-between min-w-[200px] h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:border-primary hover:ring-2 hover:ring-primary/10 transition-all duration-300 bg-card text-foreground shadow-sm"
                        >
                            <span className="truncate text-base">
                                {selectedStatuses.length === 0
                                    ? "الحالة"
                                    : `${selectedStatuses.length} محدد`}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 font-['Cairo'] bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
                        <Command className="rounded-xl">
                            <CommandInput placeholder="بحث عن حالة..." className="h-11 text-right" />
                            <CommandList className="max-h-[200px] custom-scrollbar">
                                <CommandEmpty className="py-4 text-center text-muted-foreground">لا توجد نتائج.</CommandEmpty>
                                <CommandGroup>
                                    {statuses.map((status) => (
                                        <CommandItem
                                            key={status}
                                            value={status}
                                            onSelect={() => toggleSelection(selectedStatuses, setSelectedStatuses, status)}
                                            className="cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary py-2.5"
                                        >
                                            <div className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                selectedStatuses.includes(status)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}>
                                                <Check className={cn("h-3 w-3")} />
                                            </div>
                                            {status}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Date Filter */}
                <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "justify-start text-left font-normal min-w-[260px] h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:border-primary hover:ring-2 hover:ring-primary/10 transition-all duration-300 bg-card text-foreground shadow-sm",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-5 w-5 text-primary/70" />
                            <span className="text-base pt-0.5">
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "dd/MM/yyyy")
                                    )
                                ) : (
                                    <span>اختر التاريخ</span>
                                )}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" align="start" side="bottom" avoidCollisions={false}>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3 bg-gray-50 dark:bg-slate-800 p-3 rounded-xl">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <span className="text-xs font-bold text-primary cursor-default select-none">من</span>
                                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium shadow-sm flex items-center justify-center h-10 text-foreground">
                                        {dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : "-"}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <span className="text-xs font-bold text-primary cursor-default select-none">إلى</span>
                                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium shadow-sm flex items-center justify-center h-10 text-foreground">
                                        {dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : (dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : "-")}
                                    </div>
                                </div>
                            </div>

                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRangeAndNotify}
                                numberOfMonths={1}
                                locale={arSA}
                                className="border rounded-xl bg-white dark:bg-slate-900 shadow-sm p-3"
                            />

                            <Button
                                className="w-full font-['Cairo'] rounded-xl h-10 bg-[#6AC1E8] hover:bg-[#5AB1D8] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                                onClick={() => setOpenDate(false)}
                            >
                                تأكيد الاختيار
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
