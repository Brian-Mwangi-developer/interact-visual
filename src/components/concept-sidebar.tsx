"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarMenuButton
} from "@/components/ui/sidebar";
import { Atom, Beaker, BookOpen, Calculator, ChevronRight, Globe, PenTool, Plus } from "lucide-react";
import { useState } from "react";

interface ConceptSidebarProps {
    selectedConcept: string | null;
    onConceptSelect: (concept: string) => void;
}

const subjects = [
    {
        name: "Algebra",
        icon: Calculator,
        concepts: ["Linear Equations", "Quadratic Functions", "Polynomials"],
        color: "bg-blue-100 text-blue-800"
    },
    {
        name: "Geometry",
        icon: PenTool,
        concepts: ["Triangles", "Circles", "3D Shapes"],
        color: "bg-green-100 text-green-800"
    },
    {
        name: "Physics",
        icon: Atom,
        concepts: ["Newton's Laws", "Energy", "Waves"],
        color: "bg-purple-100 text-purple-800"
    },
    {
        name: "Chemistry",
        icon: Beaker,
        concepts: ["Atomic Structure", "Chemical Bonds", "Reactions"],
        color: "bg-red-100 text-red-800"
    },
    {
        name: "Biology",
        icon: Globe,
        concepts: ["Cell Structure", "DNA", "Ecosystems"],
        color: "bg-emerald-100 text-emerald-800"
    }
];

export const ConceptSidebar = ({ selectedConcept, onConceptSelect }: ConceptSidebarProps) => {
    const [expandedSubjects, setExpandedSubjects] = useState<string[]>(['Algebra']);

    const toggleSubject = (subjectName: string) => {
        setExpandedSubjects(prev =>
            prev.includes(subjectName)
                ? prev.filter(s => s !== subjectName)
                : [...prev, subjectName]
        );
    };

    return (
        <Sidebar className="w-80">
            <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <h2 className="font-bold text-lg">Visual Learning</h2>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Concept
                </Button>
            </div>

            <SidebarContent className="p-4">
                <div className="space-y-4">
                    {subjects.map((subject) => (
                        <div key={subject.name} className="space-y-2">
                            <SidebarMenuButton
                                onClick={() => toggleSubject(subject.name)}
                                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <subject.icon className="w-5 h-5" />
                                    <span className="font-medium">{subject.name}</span>
                                    <Badge className={subject.color} variant="secondary">
                                        {subject.concepts.length}
                                    </Badge>
                                </div>
                                <ChevronRight
                                    className={`w-4 h-4 transition-transform ${expandedSubjects.includes(subject.name) ? 'rotate-90' : ''
                                        }`}
                                />
                            </SidebarMenuButton>

                            {expandedSubjects.includes(subject.name) && (
                                <div className="ml-4 space-y-1">
                                    {subject.concepts.map((concept) => (
                                        <SidebarMenuButton
                                            key={concept}
                                            onClick={() => onConceptSelect(concept)}
                                            className={`w-full p-2 text-sm rounded-md transition-colors ${selectedConcept === concept
                                                ? 'bg-blue-100 text-blue-800 font-medium'
                                                : 'hover:bg-gray-100'
                                                }`}
                                        >
                                            {concept}
                                        </SidebarMenuButton>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SidebarContent>
        </Sidebar>
    );
};
