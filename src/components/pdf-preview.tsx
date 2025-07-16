"use client";
import { cn } from "@/lib/utils";
import { Check, Copy, Download, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface PdfPreviewProps {
    pdfUrl: string
    fileName: string
    onClose: () => void
    className?: string
}

export function PdfPreview({ pdfUrl, fileName, onClose, className }: PdfPreviewProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [copied, setCopied] = useState(false);
    const [pdfText, setPdfText] = useState<string>("");
    const iframeRef = useRef<HTMLFrameElement>(null);


    useEffect(() => {

        setPdfText(
            `Extracted text from ${fileName}\n\nThis would contain the actual PDF.`,
        )
    }, [fileName])

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.25, 3))
    }

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.25, 0.5))
    }

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(pdfText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy text:", err)
        }
    }
    const handleDownload = () => {
        const link = document.createElement("a")
        link.href = pdfUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className={cn("bg-white border-b border-gray-200", className)}>
            {/* Preview Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{fileName}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-7 w-7 p-0" disabled={zoom <= 0.5}>
                        <ZoomOut className="w-3 h-3" />
                    </Button>

                    <span className="text-xs text-gray-500 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>

                    <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-7 w-7 p-0" disabled={zoom >= 3}>
                        <ZoomIn className="w-3 h-3" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handleRotate} className="h-7 w-7 p-0">
                        <RotateCw className="w-3 h-3" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handleCopyText} className="h-7 w-7 p-0">
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handleDownload} className="h-7 w-7 p-0">
                        <Download className="w-3 h-3" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700">
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            </div>
            {/* PDF Viewer */}
            <div className="h-140 bg-gray-50">
                <ScrollArea className="h-full">
                    <div className="px-4 py-2 flex justify-center">
                        <div
                            style={{
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                transformOrigin: "center center",
                            }}
                            className="transition-transform duration-200"
                        >
                            <iframe
                                ref={iframeRef}
                                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-135 border border-gray-300 rounded-lg shadow-sm"
                                title={fileName}
                            />
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )

}