// lib/excalidraw-utils-fixed.ts
import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { DrawingInstruction } from './openai';

// Generate unique IDs for Excalidraw elements
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

// Create Excalidraw element using the simplified skeleton API
export function createExcalidrawElement(
    instruction: DrawingInstruction,
    index: number
): ExcalidrawElement {
    let elementSkeleton: any;

    switch (instruction.type) {
        case 'text':
            elementSkeleton = {
                type: 'text',
                x: instruction.x,
                y: instruction.y,
                text: instruction.content || 'Default text',
                fontSize: instruction.fontSize || 16,
                strokeColor: instruction.color || '#1e1e1e',
            };
            break;

        case 'line':
            elementSkeleton = {
                type: 'line',
                x: instruction.x,
                y: instruction.y,
                strokeColor: instruction.color || '#1e1e1e',
                strokeWidth: instruction.strokeWidth || 2,
            };
            break;

        case 'arrow':
            elementSkeleton = {
                type: 'arrow',
                x: instruction.x,
                y: instruction.y,
                strokeColor: instruction.color || '#1e1e1e',
                strokeWidth: instruction.strokeWidth || 2,
                endArrowhead: 'triangle',
            };
            break;

        case 'rectangle':
            elementSkeleton = {
                type: 'rectangle',
                x: instruction.x,
                y: instruction.y,
                width: instruction.width || 100,
                height: instruction.height || 50,
                strokeColor: instruction.color || '#1e1e1e',
                strokeWidth: instruction.strokeWidth || 2,
                backgroundColor: 'transparent',
            };
            break;

        case 'ellipse':
            elementSkeleton = {
                type: 'ellipse',
                x: instruction.x,
                y: instruction.y,
                width: instruction.width || 100,
                height: instruction.height || 50,
                strokeColor: instruction.color || '#1e1e1e',
                strokeWidth: instruction.strokeWidth || 2,
                backgroundColor: 'transparent',
            };
            break;

        default:
            // Default to text element
            elementSkeleton = {
                type: 'text',
                x: instruction.x,
                y: instruction.y,
                text: instruction.content || 'Unknown element',
                fontSize: instruction.fontSize || 16,
                strokeColor: instruction.color || '#1e1e1e',
            };
    }

    // Convert skeleton to full Excalidraw element
    const elements = convertToExcalidrawElements([elementSkeleton]);
    return elements[0];
}

// Create a step-by-step animation by grouping elements by delay
export function groupElementsByDelay(
    instructions: DrawingInstruction[]
): { delay: number; elements: ExcalidrawElement[] }[] {
    const groups: { [key: number]: ExcalidrawElement[] } = {};

    instructions.forEach((instruction, index) => {
        const delay = instruction.delay || 0;
        if (!groups[delay]) {
            groups[delay] = [];
        }
        groups[delay].push(createExcalidrawElement(instruction, index));
    });

    return Object.entries(groups)
        .map(([delay, elements]) => ({
            delay: parseInt(delay),
            elements
        }))
        .sort((a, b) => a.delay - b.delay);
}

// Helper function to clear canvas
export function clearCanvas(): ExcalidrawElement[] {
    return [];
}

// Create a title element for the canvas using the skeleton API
export function createTitle(title: string, y: number = 100): ExcalidrawElement {
    const titleSkeleton = {
        type: 'text' as const,
        x: 100,
        y: y,
        text: title,
        fontSize: 20,
        strokeColor: '#1f2937'
    };

    const elements = convertToExcalidrawElements([titleSkeleton]);
    return elements[0];
}

// Create a step indicator using the skeleton API
export function createStepIndicator(
    stepNumber: number,
    totalSteps: number,
    x: number = 100,
    y: number = 150
): ExcalidrawElement {
    const stepSkeleton = {
        type: 'text' as const,
        x: x,
        y: y,
        text: `Step ${stepNumber} of ${totalSteps}`,
        fontSize: 16,
        strokeColor: '#3b82f6'
    };

    const elements = convertToExcalidrawElements([stepSkeleton]);
    return elements[0];
}

// Helper function to create multiple elements at once
export function createMultipleElements(instructions: DrawingInstruction[]): ExcalidrawElement[] {
    const skeletons = instructions.map(instruction => {
        switch (instruction.type) {
            case 'text':
                return {
                    type: 'text' as const,
                    x: instruction.x,
                    y: instruction.y,
                    text: instruction.content || 'Default text',
                    fontSize: instruction.fontSize || 16,
                    strokeColor: instruction.color || '#1e1e1e',
                };

            case 'line':
                return {
                    type: 'line' as const,
                    x: instruction.x,
                    y: instruction.y,
                    strokeColor: instruction.color || '#1e1e1e',
                    strokeWidth: instruction.strokeWidth || 2,
                };

            case 'arrow':
                return {
                    type: 'arrow' as const,
                    x: instruction.x,
                    y: instruction.y,
                    strokeColor: instruction.color || '#1e1e1e',
                    strokeWidth: instruction.strokeWidth || 2,
                    endArrowhead: 'triangle' as const,
                };

            case 'rectangle':
                return {
                    type: 'rectangle' as const,
                    x: instruction.x,
                    y: instruction.y,
                    width: instruction.width || 100,
                    height: instruction.height || 50,
                    strokeColor: instruction.color || '#1e1e1e',
                    strokeWidth: instruction.strokeWidth || 2,
                    backgroundColor: 'transparent',
                };

            case 'ellipse':
                return {
                    type: 'ellipse' as const,
                    x: instruction.x,
                    y: instruction.y,
                    width: instruction.width || 100,
                    height: instruction.height || 50,
                    strokeColor: instruction.color || '#1e1e1e',
                    strokeWidth: instruction.strokeWidth || 2,
                    backgroundColor: 'transparent',
                };

            default:
                return {
                    type: 'text' as const,
                    x: instruction.x,
                    y: instruction.y,
                    text: instruction.content || 'Unknown element',
                    fontSize: instruction.fontSize || 16,
                    strokeColor: instruction.color || '#1e1e1e',
                };
        }
    });

    return convertToExcalidrawElements(skeletons);
}