// lib/openai.ts
import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

export const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    dangerouslyAllowBrowser: true
});

// Types for our drawing operations
export interface DrawingInstruction {
    type: 'text' | 'line' | 'arrow' | 'rectangle' | 'ellipse' | 'freedraw';
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
    delay?: number; // For step-by-step drawing
}

export interface StepByStepResponse {
    explanation: string;
    drawingInstructions: DrawingInstruction[];
    stepNumber: number;
    totalSteps: number;
}

// Function to generate step-by-step drawing instructions
export async function generateStepByStepDrawing(
    question: string,
    subject: string = 'mathematics'
): Promise<StepByStepResponse[]> {
    try {
        const prompt = `
You are an expert ${subject} tutor who creates step-by-step visual explanations.
Given the question: "${question}"

Please provide a detailed step-by-step solution that can be drawn on a canvas. 
For each step, provide:
1. A clear,concise explanation (2-3 sentences)
2. Specific drawing instructions with coordinates
Make sure each step builds upon the previous one, with gradual progression.
            Favor more steps with simpler explanations over fewer complex steps.

IMPORTANT POSITIONING GUIDELINES:
- Canvas visible area is approximately 800x600 pixels
- Start content at y=200 (to avoid overlap with title/step indicator)
- Use x=100 as the left margin for text
- Space text elements 40-50 pixels apart vertically
- For mathematical expressions, use larger font sizes (18-24)
- For explanatory text, use 16px font size
- Keep all content within x=100 to x=700 and y=200 to y=500

Format your response as a JSON array where each step has:
{
  "explanation": "Clear explanation of this step",
  "drawingInstructions": [
    {
      "type": "text|line|arrow|rectangle|ellipse",
      "content": "text content if applicable",
      "x": 100-700,
      "y": 200-500,
      "width": number (optional),
      "height": number (optional),
      "endX": number (for lines/arrows),
      "endY": number (for lines/arrows),
      "fontSize": 16-24,
      "color": "#1f2937|#3b82f6|#dc2626",
      "strokeWidth": 1-3,
      "delay": number (milliseconds delay before drawing)
    }
  ],
  "stepNumber": number,
  "totalSteps": number
}

EXAMPLE for a math problem:
- Step 1: Write the original equation at y=200
- Step 2: Show the first transformation at y=250
- Step 3: Show the next step at y=300
- etc.

Make sure the drawing is clearly visible and educational.
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert educational tutor who creates visual step-by-step explanations. Always respond with valid JSON. Ensure all coordinates are within the visible canvas area (x: 100-700, y: 200-500).'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        // Parse the JSON response
        const steps = JSON.parse(content) as StepByStepResponse[];
        console.log("Steps Explanation is:", content)

        // Validate and fix coordinates if needed
        const validatedSteps = steps.map(step => ({
            ...step,
            drawingInstructions: step.drawingInstructions.map(instruction => ({
                ...instruction,
                x: Math.max(100, Math.min(700, instruction.x)),
                y: Math.max(200, Math.min(500, instruction.y)),
                fontSize: instruction.fontSize || 16,
                color: instruction.color || '#1f2937'
            }))
        }));

        return validatedSteps;

    } catch (error) {
        console.error('Error generating step-by-step drawing:', error);

        // Fallback response with proper positioning
        return [{
            explanation: "Let me help you solve this step by step",
            drawingInstructions: [
                {
                    type: 'text',
                    content: `Problem: ${question}`,
                    x: 100,
                    y: 200,
                    fontSize: 18,
                    color: '#1f2937',
                    delay: 0
                },
                {
                    type: 'text',
                    content: "I'll work through this systematically...",
                    x: 100,
                    y: 250,
                    fontSize: 16,
                    color: '#4b5563',
                    delay: 1000
                }
            ],
            stepNumber: 1,
            totalSteps: 1
        }];
    }
}

// Function to convert text to simple drawing instructions with proper positioning
export async function textToDrawingInstructions(
    text: string,
    startX: number = 100,
    startY: number = 200
): Promise<DrawingInstruction[]> {
    const instructions: DrawingInstruction[] = [];

    // Simple text parsing - you can enhance this with more sophisticated parsing
    const lines = text.split('\n');
    let currentY = startY;

    lines.forEach((line, index) => {
        if (line.trim()) {
            instructions.push({
                type: 'text',
                content: line.trim(),
                x: startX,
                y: currentY,
                fontSize: 16,
                color: '#374151',
                delay: index * 500 // Stagger the text appearance
            });
            currentY += 40; // Proper spacing between lines
        }
    });

    return instructions;
}

// Function to generate math equation drawings with proper positioning
export async function generateMathVisualization(
    equation: string,
    steps: string[]
): Promise<DrawingInstruction[]> {
    const instructions: DrawingInstruction[] = [];
    let currentY = 200; // Start in visible area

    // Draw the original equation
    instructions.push({
        type: 'text',
        content: `Original equation: ${equation}`,
        x: 100,
        y: currentY,
        fontSize: 18,
        color: '#1f2937',
        delay: 0
    });

    currentY += 60;

    // Draw each step
    steps.forEach((step, index) => {
        instructions.push({
            type: 'text',
            content: `Step ${index + 1}: ${step}`,
            x: 120,
            y: currentY,
            fontSize: 16,
            color: '#4b5563',
            delay: (index + 1) * 1000
        });

        // Add an arrow to show progression
        if (index < steps.length - 1) {
            instructions.push({
                type: 'arrow',
                x: 100,
                y: currentY + 25,
                endX: 100,
                endY: currentY + 45,
                color: '#3b82f6',
                strokeWidth: 2,
                delay: (index + 1) * 1000 + 500
            });
        }

        currentY += 70; // Adequate spacing between steps
    });

    return instructions;
}