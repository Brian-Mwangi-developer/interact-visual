"use client";

import { useEffect, useState } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

const DrawingArea = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;
    return (
        <div className="w-full h-full relative">
            <Tldraw persistenceKey="example" />
        </div>
    );
};

export default DrawingArea;