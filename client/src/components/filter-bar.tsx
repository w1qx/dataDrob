import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Calendar as CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface FilterBarProps {
    neighborhoods: string[];
    statuses: string[];
    onFilterChange: (filters: {
        neighborhoods: string[];
        statuses: string[];
        dateRange: { from?: Date; to?: Date } | undefined;
    }) => void;
}

export function FilterBar({ neighborhoods, statuses, onFilterChange }: FilterBarProps) {
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();

    const [openNeighborhoods, setOpenNeighborhoods] = useState(false);
    const [openStatuses, setOpenStatuses] = useState(false);
    const [openDate, setOpenDate] = useState(false);

    useEffect(() => {
        onFilterChange({
            neighborhoods: selectedNeighborhoods,
            statuses: selectedStatuses,
            dateRange
        });
    }, [selectedNeighborhoods, selectedStatuses, dateRange]);

    const toggleSelection = (list: string[], setList: (l: string[]) => void, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    return (
        <div className="flex flex-wrap gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 font-['Cairo']">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">تصفية حسب:</span>
            </div>

            {/* Neighborhood Filter */}
            <Popover open={openNeighborhoods} onOpenChange={setOpenNeighborhoods}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openNeighborhoods}
                        className="justify-between min-w-[200px]"
                    >
                        {selectedNeighborhoods.length === 0
                            ? "عنوان العميل الكامل"
                            : `${selectedNeighborhoods.length} محدد`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 font-['Cairo'] bg-popover border rounded-md shadow-md">
                    <Command>
                        <CommandInput placeholder="بحث عن حي..." />
                        <CommandList>
                            <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                            <CommandGroup>
                                {neighborhoods.map((neighborhood) => (
                                    <CommandItem
                                        key={neighborhood}
                                        value={neighborhood}
                                        onSelect={() => toggleSelection(selectedNeighborhoods, setSelectedNeighborhoods, neighborhood)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedNeighborhoods.includes(neighborhood) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {neighborhood}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Status Filter */}
            <Popover open={openStatuses} onOpenChange={setOpenStatuses}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openStatuses}
                        className="justify-between min-w-[200px]"
                    >
                        {selectedStatuses.length === 0
                            ? "الحالة"
                            : `${selectedStatuses.length} محدد`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 font-['Cairo'] bg-popover border rounded-md shadow-md">
                    <Command>
                        <CommandInput placeholder="بحث عن حالة..." />
                        <CommandList>
                            <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                            <CommandGroup>
                                {statuses.map((status) => (
                                    <CommandItem
                                        key={status}
                                        value={status}
                                        onSelect={() => toggleSelection(selectedStatuses, setSelectedStatuses, status)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedStatuses.includes(status) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
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
                            "justify-start text-left font-normal min-w-[240px]",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
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
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-popover border rounded-md shadow-md" align="start">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground">من</span>
                                <div className="border rounded px-2 py-1 text-sm min-w-[100px] h-8 flex items-center">
                                    {dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : "-"}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground">إلى</span>
                                <div className="border rounded px-2 py-1 text-sm min-w-[100px] h-8 flex items-center">
                                    {dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : "-"}
                                </div>
                            </div>
                        </div>

                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                            locale={arSA}
                            className="border rounded-md"
                        />

                        <Button
                            className="w-full font-['Cairo']"
                            onClick={() => setOpenDate(false)}
                        >
                            تم
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {(selectedNeighborhoods.length > 0 || selectedStatuses.length > 0 || dateRange) && (
                <Button
                    variant="ghost"
                    onClick={() => {
                        setSelectedNeighborhoods([]);
                        setSelectedStatuses([]);
                        setDateRange(undefined);
                    }}
                    className="text-destructive hover:text-destructive"
                >
                    مسح التصفية
                </Button>
            )}
        </div>
    );
}
