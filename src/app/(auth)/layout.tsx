export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left side - Illustration */}
                <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Start Your Journey
                        </h1>
                        <p className="text-xl text-gray-600">
                            Join thousands of students learning through visual storytelling
                        </p>
                    </div>
                    {/* Hand-drawn style science/math elements */}
                    <div className="relative w-80 h-80 bg-white/50 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
                        <svg viewBox="0 0 300 300" className="w-full h-full">
                            {/* DNA-like double helix */}
                            <path d="M50 50 Q100 80 150 50 T250 50" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="4,4" />
                            <path d="M50 80 Q100 50 150 80 T250 80" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="4,4" />
                            {/* Chemical bonds */}
                            <circle cx="100" cy="140" r="15" fill="#ef4444" opacity="0.7" />
                            <circle cx="150" cy="160" r="15" fill="#3b82f6" opacity="0.7" />
                            <circle cx="200" cy="140" r="15" fill="#f59e0b" opacity="0.7" />
                            <line x1="115" y1="140" x2="135" y2="160" stroke="#6b7280" strokeWidth="2" strokeDasharray="2,2" />
                            <line x1="165" y1="160" x2="185" y2="140" stroke="#6b7280" strokeWidth="2" strokeDasharray="2,2" />
                            {/* Mathematical equation */}
                            <text x="80" y="220" fontSize="16" fill="#8b5cf6" fontFamily="serif">E = mc²</text>
                            {/* Physics wave */}
                            <path d="M30 250 Q60 230 90 250 T150 250 T210 250 T270 250" stroke="#06b6d4" strokeWidth="2" fill="none" />
                        </svg>
                        {/* Floating subject icons */}
                        <div className="absolute -top-2 -right-2 bg-green-100 p-2 rounded-full">
                            {/* Atom icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="2" /><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" /></svg>
                        </div>
                        <div className="absolute -bottom-2 -left-2 bg-red-100 p-2 rounded-full">
                            {/* Beaker icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 2v6l6 6 6-6V2" /><path d="M6 18h12" /></svg>
                        </div>
                        <div className="absolute top-1/2 -right-4 bg-cyan-100 p-2 rounded-full">
                            {/* PenTool icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-6-6" /></svg>
                        </div>
                    </div>
                </div>
                {/* Right side - Clerk Auth (children) */}
                <div className="w-full max-w-md mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
