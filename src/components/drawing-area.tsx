import { ArrowRight, Calculator, Pause, Play, RotateCcw, Send } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { FloatingVoiceAssistant } from './VoiceAgent';
import { generateStepByStepDrawing } from '@/lib/openai';

interface DrawingInstruction {
    type: 'text' | 'line' | 'arrow' | 'rectangle' | 'ellipse' | 'equation';
    content?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    endX?: number;
    endY?: number;
    fontSize?: number;
    color?: string;
    strokeWidth?: number;
    delay?: number;
}

interface StepByStepResponse {
    explanation: string;
    drawingInstructions: DrawingInstruction[];
    stepNumber: number;
    totalSteps: number;
}

// const generateMockSteps = (question: string): StepByStepResponse[] => {
//     return [
//         {
//             explanation: `Analyzing the problem: "${question}"`,
//             drawingInstructions: [
//                 {
//                     type: 'text',
//                     content: 'Problem Setup',
//                     x: 50, y: 100, fontSize: 20, color: '#1e40af'
//                 },
//                 {
//                     type: 'text',
//                     content: question,
//                     x: 50, y: 130, fontSize: 16, color: '#374151'
//                 },
//                 {
//                     type: 'rectangle',
//                     x: 40, y: 90, width: 400, height: 60,
//                     color: '#3b82f6', strokeWidth: 2
//                 }
//             ],
//             stepNumber: 1,
//             totalSteps: 3
//         },
//         {
//             explanation: `Applying solution method and working through the calculation`,
//             drawingInstructions: [
//                 {
//                     type: 'text',
//                     content: 'Solution Method',
//                     x: 50, y: 180, fontSize: 18, color: '#059669'
//                 },
//                 {
//                     type: 'equation',
//                     content: '∫ sin(x)cos(x)dx',
//                     x: 50, y: 210, fontSize: 16, color: '#374151'
//                 },
//                 {
//                     type: 'text',
//                     content: 'Using substitution: u = sin(x)',
//                     x: 50, y: 240, fontSize: 14, color: '#6b7280'
//                 },
//                 {
//                     type: 'arrow',
//                     x: 200, y: 220, endX: 280, endY: 220,
//                     color: '#10b981', strokeWidth: 2
//                 }
//             ],
//             stepNumber: 2,
//             totalSteps: 3
//         },
//         {
//             explanation: `Final solution with verification`,
//             drawingInstructions: [
//                 {
//                     type: 'text',
//                     content: 'Final Answer',
//                     x: 50, y: 290, fontSize: 18, color: '#dc2626'
//                 },
//                 {
//                     type: 'equation',
//                     content: '∫ sin(x)cos(x)dx = -¼cos(2x) + C',
//                     x: 50, y: 320, fontSize: 16, color: '#374151'
//                 },
//                 {
//                     type: 'rectangle',
//                     x: 40, y: 310, width: 350, height: 30,
//                     color: '#dc2626', strokeWidth: 2
//                 }
//             ],
//             stepNumber: 3,
//             totalSteps: 3
//         }
//     ];
// };

const DrawingArea: React.FC = () => {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [steps, setSteps] = useState<StepByStepResponse[]>([]);
    const [currentExplanation, setCurrentExplanation] = useState("");
    const [visibleInstructions, setVisibleInstructions] = useState<DrawingInstruction[]>([]);

    const animationRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault?.();
        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        setCurrentStep(0);
        setSteps([]);
        setCurrentExplanation("");
        setVisibleInstructions([]);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const aiSteps = await generateStepByStepDrawing(message);
            setSteps(aiSteps);

            if (aiSteps.length > 0) {
                setCurrentExplanation(aiSteps[0].explanation);
                setVisibleInstructions([]);
            }
        } catch (error) {
            console.error("Error:", error);
            setCurrentExplanation("Error processing your question. Please try again.");
        } finally {
            setIsLoading(false);
        }

        setMessage("");
    };

    const playSteps = useCallback(() => {
        if (steps.length === 0) return;

        setIsPlaying(true);
        let stepIndex = 0;
        let allInstructions: DrawingInstruction[] = [];

        const playNextStep = () => {
            if (stepIndex >= steps.length) {
                setIsPlaying(false);
                return;
            }

            const currentStepData = steps[stepIndex];
            setCurrentStep(stepIndex + 1);
            setCurrentExplanation(currentStepData.explanation);

            allInstructions = [...allInstructions, ...currentStepData.drawingInstructions];
            setVisibleInstructions([...allInstructions]);

            stepIndex++;
            animationRef.current = setTimeout(playNextStep, 2000);
        };

        playNextStep();
    }, [steps]);

    const pauseSteps = () => {
        setIsPlaying(false);
        if (animationRef.current) {
            clearTimeout(animationRef.current);
        }
    };

    const resetSteps = () => {
        pauseSteps();
        setCurrentStep(0);
        setCurrentExplanation(steps.length > 0 ? steps[0].explanation : "");
        setVisibleInstructions([]);
    };

    const renderInstruction = (instruction: DrawingInstruction, index: number) => {
        const baseStyle = {
            position: 'absolute' as const,
            left: `${instruction.x}px`,
            top: `${instruction.y}px`,
            fontSize: `${instruction.fontSize || 16}px`,
            color: instruction.color || '#374151',
            fontWeight: instruction.fontSize && instruction.fontSize > 16 ? '600' : 'normal',
        };

        switch (instruction.type) {
            case 'text':
            case 'equation':
                return (
                    <div key={index} style={baseStyle} className="transition-all duration-300">
                        {instruction.content}
                    </div>
                );

            case 'rectangle':
                return (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${instruction.x}px`,
                            top: `${instruction.y}px`,
                            width: `${instruction.width || 100}px`,
                            height: `${instruction.height || 50}px`,
                            border: `${instruction.strokeWidth || 2}px solid ${instruction.color || '#3b82f6'}`,
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                        }}
                        className="transition-all duration-300"
                    />
                );

            case 'ellipse':
                return (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${instruction.x}px`,
                            top: `${instruction.y}px`,
                            width: `${instruction.width || 100}px`,
                            height: `${instruction.height || 50}px`,
                            border: `${instruction.strokeWidth || 2}px solid ${instruction.color || '#3b82f6'}`,
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                        }}
                        className="transition-all duration-300"
                    />
                );

            case 'arrow':
                const deltaX = (instruction.endX || instruction.x) - instruction.x;
                const deltaY = (instruction.endY || instruction.y) - instruction.y;
                const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

                return (
                    <div key={index} style={{ position: 'absolute', left: `${instruction.x}px`, top: `${instruction.y}px` }}>
                        <div
                            style={{
                                width: `${length}px`,
                                height: `${instruction.strokeWidth || 2}px`,
                                backgroundColor: instruction.color || '#3b82f6',
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: '0 50%',
                                position: 'relative',
                            }}
                        >
                            <ArrowRight
                                className="w-4 h-4 absolute -top-1 -right-2"
                                style={{ color: instruction.color || '#3b82f6' }}
                            />
                        </div>
                    </div>
                );

            case 'line':
                const lineDeltaX = (instruction.endX || instruction.x + 50) - instruction.x;
                const lineDeltaY = (instruction.endY || instruction.y) - instruction.y;
                const lineLength = Math.sqrt(lineDeltaX * lineDeltaX + lineDeltaY * lineDeltaY);
                const lineAngle = Math.atan2(lineDeltaY, lineDeltaX) * (180 / Math.PI);

                return (
                    <div key={index} style={{ position: 'absolute', left: `${instruction.x}px`, top: `${instruction.y}px` }}>
                        <div
                            style={{
                                width: `${lineLength}px`,
                                height: `${instruction.strokeWidth || 2}px`,
                                backgroundColor: instruction.color || '#3b82f6',
                                transform: `rotate(${lineAngle}deg)`,
                                transformOrigin: '0 50%',
                            }}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50">
            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                    </div>
                </div>
            )}

            {/* Canvas area */}
            <div className="flex-1 relative bg-white border border-gray-200 m-4 rounded-lg overflow-hidden">
                {/* Step indicator */}
                {currentStep > 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Step {currentStep} of {steps.length}
                    </div>
                )}

                {/* Canvas content */}
                <div className="relative w-full h-full">
                    {visibleInstructions.length === 0 && !isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h2 className="text-2xl font-bold text-gray-700 mb-2">Mathematical Visualizer</h2>
                                <p className="text-gray-500">Ask any math question to see step-by-step solutions</p>
                            </div>
                        </div>
                    )}

                    {/* Render instructions */}
                    {visibleInstructions.map((instruction, index) =>
                        renderInstruction(instruction, index)
                    )}
                </div>

                {/* Grid background */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(90deg, #000 1px, transparent 1px),
                            linear-gradient(180deg, #000 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                    }}
                />
            </div>

            {/* Bottom panel */}
            <div className="bg-white border-t border-gray-200 p-4">
                {/* Explanation */}
                {currentExplanation && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-blue-900">AI Explanation</h3>
                            <div className="flex gap-2">
                                {steps.length > 0 && (
                                    <>
                                        <button
                                            onClick={isPlaying ? pauseSteps : playSteps}
                                            disabled={isLoading}
                                            className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
                                            title={isPlaying ? "Pause" : "Play"}
                                        >
                                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={resetSteps}
                                            disabled={isLoading}
                                            className="p-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-colors"
                                            title="Reset"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-blue-800">{currentExplanation}</p>
                    </div>
                )}

                {/* Input */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Ask a math question (e.g., 'Find the integral of sin(x)cos(x)dx')"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isLoading && message.trim()) {
                                handleSend(e as React.FormEvent);
                            }
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !message.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </div>
                <FloatingVoiceAssistant assistantId="f4f6a1ae-e29b-47ad-b9be-79801ff2d638" />
            </div>
        </div>
    );
};

export default DrawingArea;