import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { useState } from "react";

export const TopBar = () => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                {/* <SidebarTrigger /> */}

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search concepts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="">
                    <h2 className="text-md font-semibold">Concepts</h2>
                </div>
                <UserButton />
            </div>
        </header>
    );
};
