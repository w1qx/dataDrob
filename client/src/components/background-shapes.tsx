import { memo } from "react";

export const BackgroundShapes = memo(function BackgroundShapes() {
    return (
        <div className="fixed inset-0 z-0 bg-slate-950 pointer-events-none overflow-hidden">
            {/* CSS Animations defined inline for simplicity */}
            <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(10px, -10px) rotate(3deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-15px, 8px) rotate(-5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(8px, 12px) rotate(4deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        .shape-slow { animation: float-slow 18s ease-in-out infinite; }
        .shape-medium { animation: float-medium 14s ease-in-out infinite; }
        .shape-fast { animation: float-fast 10s ease-in-out infinite; }
        .glow-pulse { animation: pulse-glow 6s ease-in-out infinite; }
        .star-twinkle { animation: twinkle 4s ease-in-out infinite; }
        .star-twinkle-delayed { animation: twinkle 6s ease-in-out infinite 2s; }
      `}</style>

            {/* Global Gradients */}
            <svg width="0" height="0">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan-400 */}
                        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue-500 */}
                    </linearGradient>
                    <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" /> {/* Indigo-400 */}
                        <stop offset="100%" stopColor="#2dd4bf" /> {/* Teal-400 */}
                    </linearGradient>
                </defs>
            </svg>

            {/* Star Field */}
            <div className="absolute inset-0 z-[-1]">
                <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10%" cy="20%" r="1.5" fill="white" className="star-twinkle" opacity="0.6" />
                    <circle cx="85%" cy="15%" r="1" fill="white" className="star-twinkle-delayed" opacity="0.4" />
                    <circle cx="50%" cy="50%" r="1.2" fill="white" className="star-twinkle" opacity="0.5" />
                    <circle cx="25%" cy="75%" r="1.5" fill="white" className="star-twinkle-delayed" opacity="0.6" />
                    <circle cx="80%" cy="80%" r="1" fill="white" className="star-twinkle" opacity="0.4" />
                    <circle cx="5%" cy="90%" r="1.2" fill="white" className="star-twinkle-delayed" opacity="0.5" />
                    <circle cx="95%" cy="40%" r="1.5" fill="white" className="star-twinkle" opacity="0.6" />
                    <circle cx="40%" cy="10%" r="1" fill="white" className="star-twinkle-delayed" opacity="0.4" />
                    <circle cx="60%" cy="90%" r="1.2" fill="white" className="star-twinkle" opacity="0.5" />
                    <circle cx="15%" cy="50%" r="1" fill="white" className="star-twinkle-delayed" opacity="0.4" />
                    <circle cx="70%" cy="30%" r="1.5" fill="white" className="star-twinkle" opacity="0.6" />
                    <circle cx="30%" cy="60%" r="1.2" fill="white" className="star-twinkle-delayed" opacity="0.5" />

                    {/* Smaller distant stars */}
                    <circle cx="22%" cy="12%" r="0.8" fill="white" opacity="0.3" />
                    <circle cx="92%" cy="82%" r="0.8" fill="white" opacity="0.3" />
                    <circle cx="45%" cy="45%" r="0.8" fill="white" opacity="0.3" />
                    <circle cx="12%" cy="88%" r="0.8" fill="white" opacity="0.3" />
                    <circle cx="78%" cy="22%" r="0.8" fill="white" opacity="0.3" />
                </svg>
            </div>

            {/* Left Shape - Large Icosahedron (The "Good" Shape) */}
            <div className="absolute top-1/4 -left-20 opacity-30 shape-slow glow-pulse scale-125">
                <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 10 L177.9 55 V145 L100 190 L22.1 145 V55 L100 10Z" stroke="url(#grad1)" strokeWidth="0.8" />
                    <path d="M100 190 L177.9 55 L22.1 55 L100 190Z" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.7" />
                    <line x1="100" y1="10" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="177.9" y1="55" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="177.9" y1="145" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="100" y1="190" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="22.1" y1="145" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="22.1" y1="55" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                </svg>
            </div>

            {/* Right Upper Shape - Medium Icosahedron (Rotated Variation) */}
            <div className="absolute top-10 -right-10 opacity-25 shape-medium glow-pulse">
                <svg width="300" height="300" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(45deg)' }}>
                    <path d="M100 10 L177.9 55 V145 L100 190 L22.1 145 V55 L100 10Z" stroke="url(#grad2)" strokeWidth="0.8" />
                    <path d="M100 190 L177.9 55 L22.1 55 L100 190Z" stroke="url(#grad2)" strokeWidth="0.5" opacity="0.7" />
                    <line x1="100" y1="10" x2="100" y2="100" stroke="url(#grad2)" strokeWidth="0.5" />
                    <line x1="177.9" y1="55" x2="100" y2="100" stroke="url(#grad2)" strokeWidth="0.5" />
                    <line x1="177.9" y1="145" x2="100" y2="100" stroke="url(#grad2)" strokeWidth="0.5" />
                    <line x1="100" y1="190" x2="100" y2="100" stroke="url(#grad2)" strokeWidth="0.5" />
                    <line x1="22.1" y1="145" x2="100" y2="100" stroke="url(#grad2)" strokeWidth="0.5" />
                    <line x1="22.1" y1="55" x2="100" y2="100" stroke="url(#grad2)" strokeWidth="0.5" />
                </svg>
            </div>

            {/* Right Lower Shape - Small Icosahedron (Different Angle) */}
            <div className="absolute bottom-20 right-20 opacity-20 shape-fast glow-pulse">
                <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-15deg)' }}>
                    <path d="M100 10 L177.9 55 V145 L100 190 L22.1 145 V55 L100 10Z" stroke="url(#grad1)" strokeWidth="0.8" />
                    <path d="M100 190 L177.9 55 L22.1 55 L100 190Z" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.7" />
                    <line x1="100" y1="10" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="177.9" y1="55" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="177.9" y1="145" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="100" y1="190" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="22.1" y1="145" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                    <line x1="22.1" y1="55" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="0.5" />
                </svg>
            </div>
        </div>
    );
});
