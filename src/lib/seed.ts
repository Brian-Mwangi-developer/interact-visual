// // lib/openai.ts
// import OpenAI from 'openai';

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     dangerouslyAllowBrowser: true
// });

// export interface DrawingInstruction {
//     type: 'text' | 'arrow' | 'rectangle' | 'ellipse' | 'line' | 'freedraw';
//     content?: string;
//     coordinates: {
//         x: number;
//         y: number;
//         width?: number;
//         height?: number;
//         endX?: number;
//         endY?: number;
//     };
//     style?: {
//         strokeColor?: string;
//         backgroundColor?: string;
//         fontSize?: number;
//         strokeWidth?: number;
//     };
// }

// export interface StepByStepResponse {
//     explanation: string;
//     drawingInstructions: DrawingInstruction[];
//     stepNumber: number;
//     totalSteps: number;
// }

// export class OpenAIExcalidrawClient {
//     private async generatePrompt(question: string): string {
//         return `You are an AI tutor that creates step-by-step visual explanations. 
    
// For the question: "${question}"

// Please provide a detailed step-by-step explanation that can be visualized on a drawing canvas. 

// Respond in the following JSON format:
// {
//   "explanation": "Step-by-step text explanation",
//   "drawingInstructions": [
//     {
//       "type": "text|arrow|rectangle|ellipse|line",
//       "content": "text content if applicable",
//       "coordinates": {
//         "x": number,
//         "y": number,
//         "width": number (optional),
//         "height": number (optional),
//         "endX": number (optional for arrows/lines),
//         "endY": number (optional for arrows/lines)
//       },
//       "style": {
//         "strokeColor": "#000000",
//         "backgroundColor": "#ffffff",
//         "fontSize": 16,
//         "strokeWidth": 2
//       }
//     }
//   ],
//   "stepNumber": 1,
//   "totalSteps": number
// }

// Make sure to:
// 1. Break down complex problems into multiple steps
// 2. Use appropriate visual elements (arrows for flow, rectangles for boxes, text for labels)
// 3. Position elements logically on the canvas (start from top-left, move right and down)
// 4. Use different colors to highlight important parts
// 5. Keep text concise but informative`;
//     }

//     async getStepByStepExplanation(question: string, currentStep: number = 1): Promise<StepByStepResponse> {
//         try {
//             const prompt = await this.generatePrompt(question);

//             const response = await openai.chat.completions.create({
//                 model: "gpt-4",
//                 messages: [
//                     {
//                         role: "system",
//                         content: "You are an expert educational AI that creates visual step-by-step explanations for learning. Always respond with valid JSON."
//                     },
//                     {
//                         role: "user",
//                         content: `${prompt}\n\nGenerate step ${currentStep} of the explanation.`
//                     }
//                 ],
//                 temperature: 0.7,
//                 max_tokens: 1500
//             });

//             const content = response.choices[0]?.message?.content;
//             if (!content) {
//                 throw new Error('No response from OpenAI');
//             }

//             // Parse the JSON response
//             const parsedResponse: StepByStepResponse = JSON.parse(content);
//             return parsedResponse;

//         } catch (error) {
//             console.error('Error getting explanation from OpenAI:', error);

//             // Fallback response
//             return {
//                 explanation: "I'm sorry, I encountered an error. Please try again with a simpler question.",
//                 drawingInstructions: [
//                     {
//                         type: 'text',
//                         content: 'Error: Please try again',
//                         coordinates: { x: 100, y: 100 },
//                         style: { fontSize: 16, strokeColor: '#ff0000' }
//                     }
//                 ],
//                 stepNumber: 1,
//                 totalSteps: 1
//             };
//         }
//     }

//     async generateMathSolution(problem: string): Promise<StepByStepResponse[]> {
//         try {
//             const response = await openai.chat.completions.create({
//                 model: "gpt-4",
//                 messages: [
//                     {
//                         role: "system",
//                         content: `You are a math tutor that creates visual step-by-step solutions. 
//             Break down the problem into clear steps and provide drawing instructions for each step.
//             Return an array of steps, each following the StepByStepResponse format.`
//                     },
//                     {
//                         role: "user",
//                         content: `Solve this math problem step by step with visual representations: ${problem}`
//                     }
//                 ],
//                 temperature: 0.3,
//                 max_tokens: 2000
//             });

//             const content = response.choices[0]?.message?.content;
//             if (!content) {
//                 throw new Error('No response from OpenAI');
//             }

//             return JSON.parse(content);
//         } catch (error) {
//             console.error('Error generating math solution:', error);
//             return [];
//         }
//     }
// }

// export const openaiClient = new OpenAIExcalidrawClient();