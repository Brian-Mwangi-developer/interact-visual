"use client";
import { ConceptSidebar } from "@/components/concept-sidebar";
import DrawingArea from "@/components/drawing-area";
import { TopBar } from "@/components/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
// import { VoiceAssistant } from "@/components/voice-assistant";
import { useState } from "react";

const DashboardPage = () => {

    const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gray-50">

                <ConceptSidebar
                    selectedConcept={selectedConcept}
                    onConceptSelect={setSelectedConcept}
                />
                <main className="flex-1 flex flex-col ml-20">
                    <TopBar />

                    <div className="flex-1 relative">
                        <DrawingArea />
                        {/* <VoiceAssistant /> */}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default DashboardPage;
