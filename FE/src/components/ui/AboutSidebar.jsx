// src/components/ui/AboutSidebar.jsx
import React from 'react';

const AboutSidebar = ({ isOpen, onClose }) => {
    return (
        <div>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} rounded-l-xl`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-wide">About StockSim Pro</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Website Information */}
                    <div className="mb-8">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            <strong>StockSim Pro</strong> is a cutting-edge stock market simulation platform designed to provide a realistic and risk-free trading experience. Perfect for both beginners and experienced traders looking to test new strategies.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Key Features</h3>
                        <ul className="space-y-3 text-gray-600 text-sm">
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span> Trade with simulated real-time data.</li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span> Build and manage a virtual portfolio.</li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span> Track stocks with a personalized watchlist.</li>
                        </ul>
                    </div>

                    {/* Developer Information */}
                    <div className="mt-auto">
                         <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">About the Developer</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            This application was created by a passionate full-stack developer specializing in creating dynamic and user-friendly web applications.
                        </p>
                        <div className="space-y-2">
                           <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                               <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z"/></svg>
                               Portfolio
                           </a>
                           <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                               <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-7 2h-2v5H8v2h2v5h2v-5h2v-2h-2V5z"/></svg>
                               LinkedIn
                           </a>
                           <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                               <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z"/></svg>
                               GitHub
                           </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSidebar;
