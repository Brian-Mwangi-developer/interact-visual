import { clearCanvas, createStepIndicator, createTitle, groupElementsByDelay } from "@/lib/excalidraw-utils";
import { generateStepByStepDrawing, StepByStepResponse } from "@/lib/openai";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Pause, Play, RotateCcw, Send } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";

const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false }
);

interface DrawingAreaProps {
    subject?: string;
}

export const DrawingArea: React.FC<DrawingAreaProps> = ({ subject = "mathematics" }) => {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [steps, setSteps] = useState<StepByStepResponse[]>([]);
    const [currentExplanation, setCurrentExplanation] = useState("");

    const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
    const animationRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;
        console.log("Sending message:", message);
        console.log("Subject:", subject);
        setIsLoading(true);
        setCurrentStep(0);
        setSteps([]);
        setCurrentExplanation("");

        try {
            // Clear the canvas first
            if (excalidrawRef.current) {
                excalidrawRef.current.updateScene({
                    elements: clearCanvas(),
                });
            }

            // Generate AI response with drawing instructions
            const aiSteps = await generateStepByStepDrawing(message, subject);
            console.log("AI Steps:", aiSteps);
            setSteps(aiSteps);

            if (aiSteps.length > 0) {
                // Add title to the first step positioned in visible area
                const titleElement = createTitle(`Question: ${message}`, 100);

                // Start with just the title
                if (excalidrawRef.current) {
                    excalidrawRef.current.updateScene({
                        elements: [titleElement],
                    });
                }

                setCurrentExplanation(aiSteps[0].explanation);
            }
        } catch (error) {
            console.error("Error generating AI response:", error);
            setCurrentExplanation("Sorry, I encountered an error while processing your question.");
        } finally {
            setIsLoading(false);
        }

        setMessage("");
    };

    const playSteps = useCallback(() => {
        if (steps.length === 0) return;

        setIsPlaying(true);
        let stepIndex = 0;

        const titleElement = createTitle(`Question: ${message}`, 100);
        let allElements: ExcalidrawElement[] = [titleElement];

        const playNextStep = () => {
            if (stepIndex >= steps.length) {
                setIsPlaying(false);
                return;
            }

            const currentStepData = steps[stepIndex];
            setCurrentStep(stepIndex + 1);
            setCurrentExplanation(currentStepData.explanation);

            // Add step indicator positioned properly
            const stepIndicator = createStepIndicator(
                stepIndex + 1,
                steps.length,
                100,
                150
            );

            // Group elements by delay for this step
            const elementGroups = groupElementsByDelay(currentStepData.drawingInstructions);

            let groupIndex = 0;
            const addElementGroup = () => {
                if (groupIndex >= elementGroups.length) {
                    stepIndex++;
                    animationRef.current = setTimeout(playNextStep, 2000); // Pause between steps
                    return;
                }

                const group = elementGroups[groupIndex];
                allElements = [...allElements, stepIndicator, ...group.elements];

                if (excalidrawRef.current) {
                    excalidrawRef.current.updateScene({
                        elements: allElements,
                    });
                }

                groupIndex++;
                const nextGroup = elementGroups[groupIndex];
                const delay = nextGroup ? nextGroup.delay - group.delay : 1000;

                animationRef.current = setTimeout(addElementGroup, Math.max(delay, 500));
            };

            addElementGroup();
        };

        playNextStep();
    }, [steps, message]);

    const pauseSteps = () => {
        setIsPlaying(false);
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
    };

    const resetSteps = () => {
        pauseSteps();
        setCurrentStep(0);
        setCurrentExplanation(steps.length > 0 ? steps[0].explanation : "");

        if (excalidrawRef.current) {
            const titleElement = createTitle(`Question: ${message}`, 100);
            excalidrawRef.current.updateScene({
                elements: [titleElement],
            });
        }
    };

    return (
        <div className="relative w-full h-[90vh] flex flex-col">
            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating drawing for {subject}...</span>
                    </div>
                </div>
            )}

            {/* Excalidraw Canvas */}
            <div className="flex-1 relative">
                <Excalidraw
                    ref={excalidrawRef}
                    initialData={{
                        appState: {
                            viewBackgroundColor: "#ffffff",
                            gridSize: null,
                        },
                    }}
                />
            </div>

            {/* Bottom Panel */}
            <div className="relative z-40 bg-white border-t border-gray-200 p-4 min-h-[120px]">
                {/* Explanation Display */}
                {currentExplanation && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-blue-800">
                                {currentStep > 0 ? `Step ${currentStep}` : "Getting Started"}
                            </h3>
                            {steps.length > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={isPlaying ? pauseSteps : playSteps}
                                        disabled={isLoading}
                                        className="p-2 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-4 h-4 text-blue-600" />
                                        ) : (
                                            <Play className="w-4 h-4 text-blue-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={resetSteps}
                                        disabled={isLoading}
                                        className="p-2 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
                                    >
                                        <RotateCcw className="w-4 h-4 text-blue-600" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-blue-700">{currentExplanation}</p>
                    </div>
                )}

                {/* Input Form */}
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 max-w-2xl mx-auto"
                >
                    <input
                        type="text"
                        className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder={`Ask a question about ${subject}...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !message.trim()}
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="text-white w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};