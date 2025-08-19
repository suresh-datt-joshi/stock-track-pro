// src/components/auth/Welcome.jsx
import React, { useEffect, useState } from 'react';

// New component for a more complex stock chart animation
const StockChartAnimation = () => {
    const [paths, setPaths] = useState([]);
    const [bars, setBars] = useState([]);

    useEffect(() => {
        const generateChart = () => {
            // Generate multiple lines for the line chart
            const newPaths = Array.from({ length: 3 }).map(() => {
                let d = 'M 0 50';
                for (let i = 1; i <= 20; i++) {
                    const x = i * 5;
                    const y = 50 + (Math.random() - 0.5) * 45;
                    d += ` L ${x} ${y}`;
                }
                return d;
            });
            setPaths(newPaths);

            // Generate bars for the bar chart
            const newBars = Array.from({ length: 20 }).map((_, i) => ({
                x: i * 5,
                y: 100 - (Math.random() * 50 + 10),
                height: Math.random() * 50 + 10,
                fill: Math.random() > 0.5 ? 'rgba(74, 222, 128, 0.6)' : 'rgba(239, 68, 68, 0.6)',
            }));
            setBars(newBars);
        };

        generateChart();
        const interval = setInterval(generateChart, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-0 opacity-30">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Bar Chart */}
                {bars.map((bar, i) => (
                    <rect key={i} x={bar.x} y={bar.y} width="3" height={bar.height} fill={bar.fill} style={{ transition: 'all 1.5s ease-in-out' }} />
                ))}
                {/* Line Chart */}
                {paths.map((path, i) => (
                    <path key={i} d={path} fill="none" stroke={i === 1 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(255, 255, 255, 0.4)'} strokeWidth="0.5" style={{ transition: 'd 1.5s ease-in-out' }} />
                ))}
            </svg>
        </div>
    );
};


const Welcome = ({ onLetsGo }) => {
    // Array of SVG icons for the background animation
    const icons = [
        // Stock chart up
        <svg key="1" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15l5-5 4 4 8-8"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 3h5v5"></path></svg>,
        // Dollar sign
        <svg key="2" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 1v22m-4-8h8m-8-4h8m-1-4a4 4 0 00-8 0"></path></svg>,
        // Briefcase
        <svg key="3" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7L4 7a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3"></path></svg>,
        // Pie chart
        <svg key="4" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.21 15.89A10 10 0 118.11 3.79M22 12A10 10 0 0012 2v10z"></path></svg>,
    ];

    const handleLetsGo = () => {
        onLetsGo();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-800 to-purple-900 text-white relative overflow-hidden">
            {/* Stock Chart Animation */}
            <StockChartAnimation />

            {/* Animated background icons */}
            <div className="absolute inset-0 z-0">
                {Array.from({ length: 15 }).map((_, index) => (
                    <div
                        key={index}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 20 + 15}s`,
                            animationDelay: `${Math.random() * -20}s`,
                            opacity: Math.random() * 0.1 + 0.05,
                            transform: `scale(${Math.random() * 0.5 + 0.5})`,
                        }}
                    >
                        {icons[index % icons.length]}
                    </div>
                ))}
            </div>

            {/* Main content */}
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative z-10">
                <div className="max-w-2xl p-8">
                    <img src="/p1.jpeg" alt="StockSim Pro Logo" className="h-24 w-24 mx-auto mb-6 rounded-full shadow-lg border-2 border-white/50" />
                    <h1 className="text-5xl font-extrabold mb-4 text-shadow-lg">Welcome to StockSim Pro</h1>
                    <p className="text-xl mb-8 leading-relaxed text-shadow">
                        Master the stock market with real-time trading, portfolio management, and zero risk
                    </p>
                    <button 
                        onClick={handleLetsGo} 
                        className="bg-white text-blue-600 font-bold text-lg py-3 px-8 rounded-full shadow-xl hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
                    >
                        Let's Go!
                    </button>
                </div>
            </div>

            {/* Add keyframes for the animation to your CSS file */}
            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(180deg); }
                        100% { transform: translateY(0) rotate(360deg); }
                    }
                    .animate-float {
                        animation-name: float;
                        animation-timing-function: ease-in-out;
                        animation-iteration-count: infinite;
                    }
                    .text-shadow-lg {
                        text-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    }
                    .text-shadow {
                        text-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    }
                `}
            </style>
        </div>
    );
};

export default Welcome;
