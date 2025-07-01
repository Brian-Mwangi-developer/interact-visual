// lib/excalidraw-utils-fixed.ts
import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { DrawingInstruction } from './openai';

// Generate unique IDs for Excalidraw elements
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

// Generate fractional index (Excalidraw requirement)
export const generateFractionalIndex = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

// Utility to create proper Excalidraw elements with correct types
export function createExcalidrawElement(
    instruction: DrawingInstruction,
    index: number
): ExcalidrawElement {
    // Base properties that all elements need
    const baseProps = {
        id: generateId(),
        x: instruction.x,
        y: instruction.y,
        strokeColor: instruction.color || '#1e1e1e',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: instruction.strokeWidth || 2,
        strokeStyle: 'solid' as const,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: Math.floor(Math.random() * 1000000),
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        groupIds: [],
        frameId: null,
        roundness: null,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        index: generateFractionalIndex(), // This needs to be a string (FractionalIndex)
        customData: null
    };

    switch (instruction.type) {
        case 'text': {
            const textWidth = (instruction.content || '').length * ((instruction.fontSize || 16) * 0.6);
            const textHeight = instruction.fontSize || 16;

            return {
                ...baseProps,
                type: 'text',
                text: instruction.content || '',
                fontSize: instruction.fontSize || 16,
                fontFamily: 1,
                textAlign: 'left' as const,
                verticalAlign: 'top' as const,
                containerId: null,
                originalText: instruction.content || '',
                width: textWidth,
                height: textHeight,
                baseline: textHeight,
                lineHeight: 1.25,
                autoResize: true
            } as ExcalidrawElement;
        }

        case 'line': {
            const endX = instruction.endX || instruction.x + 100;
            const endY = instruction.endY || instruction.y;
            const width = Math.abs(endX - instruction.x);
            const height = Math.abs(endY - instruction.y);

            return {
                ...baseProps,
                type: 'line',
                points: [
                    [0, 0],
                    [endX - instruction.x, endY - instruction.y]
                ],
                lastCommittedPoint: null,
                startBinding: null,
                endBinding: null,
                startArrowhead: null,
                endArrowhead: null,
                width: Math.max(width, 1),
                height: Math.max(height, 1),
            } as ExcalidrawElement;
        }

        case 'arrow': {
            const endX = instruction.endX || instruction.x + 100;
            const endY = instruction.endY || instruction.y + 50;
            const width = Math.abs(endX - instruction.x);
            const height = Math.abs(endY - instruction.y);

            return {
                ...baseProps,
                type: 'arrow',
                points: [
                    [0, 0],
                    [endX - instruction.x, endY - instruction.y]
                ],
                lastCommittedPoint: null,
                startBinding: null,
                endBinding: null,
                startArrowhead: null,
                endArrowhead: 'arrow' as const,
                width: Math.max(width, 1),
                height: Math.max(height, 1),
            } as ExcalidrawElement;
        }

        case 'rectangle': {
            return {
                ...baseProps,
                type: 'rectangle',
                width: instruction.width || 100,
                height: instruction.height || 50,
            } as ExcalidrawElement;
        }

        case 'ellipse': {
            return {
                ...baseProps,
                type: 'ellipse',
                width: instruction.width || 100,
                height: instruction.height || 50,
            } as ExcalidrawElement;
        }

        default: {
            // Default to text element
            const defaultText = instruction.content || 'Unknown element';
            const textWidth = defaultText.length * 10;

            return {
                ...baseProps,
                type: 'text',
                text: defaultText,
                fontSize: 16,
                fontFamily: 1,
                textAlign: 'left' as const,
                verticalAlign: 'top' as const,
                containerId: null,
                originalText: defaultText,
                width: textWidth,
                height: 16,
                baseline: 16,
                lineHeight: 1.25,
                autoResize: true
            } as ExcalidrawElement;
        }
    }
}

// Convert array of drawing instructions to Excalidraw elements
export function convertToExcalidrawElements(
    instructions: DrawingInstruction[]
): ExcalidrawElement[] {
    return instructions.map((instruction, index) => createExcalidrawElement(instruction, index));
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

// Helper function to add mathematical symbols and formatting
export function formatMathText(text: string): string {
    // Basic math formatting - you can expand this
    return text
        .replace(/\*\*/g, '^') // ** to superscript
        .replace(/sqrt\((.*?)\)/g, '√($1)')
        .replace(/pi/g, 'π')
        .replace(/alpha/g, 'α')
        .replace(/beta/g, 'β')
        .replace(/gamma/g, 'γ')
        .replace(/theta/g, 'θ')
        .replace(/delta/g, 'δ')
        .replace(/sum/g, '∑')
        .replace(/integral/g, '∫')
        .replace(/infinity/g, '∞');
}

// Create a title element for the canvas - positioned in visible area
export function createTitle(title: string, y: number = 100): ExcalidrawElement {
    return createExcalidrawElement({
        type: 'text',
        content: title,
        x: 100, // Moved to visible area
        y: y,
        fontSize: 20,
        color: '#1f2937'
    }, 0);
}

// Create a step indicator - positioned in visible area
export function createStepIndicator(
    stepNumber: number,
    totalSteps: number,
    x: number = 100,
    y: number = 150
): ExcalidrawElement {
    return createExcalidrawElement({
        type: 'text',
        content: `Step ${stepNumber} of ${totalSteps}`,
        x: x,
        y: y,
        fontSize: 16,
        color: '#3b82f6'
    }, 0);
}

// Helper to create a box around content
export function createContentBox(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = '#e5e7eb'
): ExcalidrawElement {
    return createExcalidrawElement({
        type: 'rectangle',
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
    }, 0);
}

// Helper to create mathematical expressions with proper spacing - positioned in visible area
export function createMathExpression(
    expression: string,
    x: number,
    y: number,
    fontSize: number = 18
): ExcalidrawElement[] {
    const formattedExpression = formatMathText(expression);

    return [
        createExcalidrawElement({
            type: 'text',
            content: formattedExpression,
            x: x,
            y: y,
            fontSize: fontSize,
            color: '#1f2937'
        }, 0)
    ];
}

// Create a visual separator line
export function createSeparator(
    x: number,
    y: number,
    width: number,
    color: string = '#d1d5db'
): ExcalidrawElement {
    return createExcalidrawElement({
        type: 'line',
        x: x,
        y: y,
        endX: x + width,
        endY: y,
        color: color,
        strokeWidth: 1
    }, 0);
}

// Get canvas center coordinates for better positioning
export function getCanvasCenter(): { x: number; y: number } {
    return { x: 400, y: 300 }; // Assuming standard canvas size
}

// Helper to position elements in a readable flow
export function getNextPosition(currentY: number, spacing: number = 40): { x: number; y: number } {
    return {
        x: 100, // Standard left margin
        y: currentY + spacing
    };
}