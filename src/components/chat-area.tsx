"use client";

import { cn } from "@/lib/utils";
import { useChat } from '@ai-sdk/react';
import { Eye, EyeOff, FileText, Paperclip, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { PdfPreview } from "./pdf-preview";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";

type Props = {
    className?: string;
}

export const ChatArea = ({ className }: Props) => {
    const [selectedPdf, setSelectedPdf] = useState<{
        file: File
        url: string
        name: string
    } | null>(null);

    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const [uploadedPdfs, setUploadedPdfs] = useState<
        Array<{
            file: File
            url: string
            name: string
        }>
    >([]);
    const [showPreview, setShowPreview] = useState(false)
    const fileInputref = useRef<HTMLInputElement>(null);
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
    })

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files
        if (selectedFiles && selectedFiles.length > 0) {
            const pdfFiles = Array.from(selectedFiles).filter((file) => file.type === "application/pdf");
            pdfFiles.forEach((file) => {
                const url = URL.createObjectURL(file);
                setUploadedPdfs((prev) => [...prev, { file, url, name: file.name }]);
                setSelectedPdf({ file, url, name: file.name });
            })
            setFiles(selectedFiles)
        }
    }
    const removePdf = (index: number) => {
        setUploadedPdfs((prev) => {
            const newPdfs = [...prev]
            URL.revokeObjectURL(newPdfs[index].url)
            newPdfs.splice(index, 1)
            return newPdfs
        })
    }
    const openPreview = (pdf: { file: File; url: string; name: string }) => {
        setSelectedPdf(pdf)
        setShowPreview(true)
    }



    return (
        <div className={cn("flex flex-col h-full bg-white border-1 border-gray-200", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                </div>
                {selectedPdf && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                )}
            </div>
            {/* PDF Preview */}
            {showPreview && selectedPdf && (
                <div className="relative">
                    <PdfPreview pdfUrl={selectedPdf.url} fileName={selectedPdf.name} onClose={() => setShowPreview(false)} />
                </div>
            )}
            {/* Uploaded Pdf */}
            {uploadedPdfs.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-2">Uploaded Documents</div>
                    <div className="space-y-2">
                        {uploadedPdfs.map((pdf, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <FileText className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-gray-700 flex-1 truncate">{pdf.name}</span>
                                <Button variant="ghost" size="sm" onClick={() => openPreview(pdf)} className="h-6 w-6 p-0">
                                    <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePdf(index)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )
            }
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm">Upload a PDF and start chatting!</p>
                            <p className="text-xs text-gray-400 mt-1">I can help you analyze documents and answer questions.</p>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] rounded-lg px-4 py-2",
                                    message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900",
                                )}
                            >
                                <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                                {/* Show attachments */}
                                {message.experimental_attachments?.map((attachment, index) => (
                                    <div key={index} className="mt-2 p-2 bg-black/10 rounded">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            <span className="text-xs">{attachment.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
                <form className="space-y-3" onSubmit={() => { }}>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Textarea
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask about your documents..."
                                className="pr-10 py-5 w-full resize-y max-w-[300px]"
                                disabled={isLoading}
                            />
                            <Input
                                type="file"
                                accept=".pdf"
                                ref={fileInputref}
                                onChange={handleFileUpload}
                                multiple
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputref.current?.click()}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0">
                                <Paperclip className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button type="submit"
                            className="mt-3"
                            onClick={handleSubmit}
                        >
                            <Send className="w-6 h-6" />
                        </Button>
                    </div>
                    {files && files.length > 0 && <div className="text-xs text-gray-500">{files.length} file(s) selected</div>}
                </form>
            </div>
        </div>
    )
}

