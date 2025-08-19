// src/components/dashboard/FinancialNews.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';

const FinancialNews = () => {
    const { currentUser } = useAuth();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/news`, {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Could not fetch news.');
                }

                const data = await response.json();
                setArticles(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [currentUser.token]);

    if (loading) {
        return <div className="text-center p-8">Loading Financial News...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                📰 Financial News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.length === 0 && <p className="col-span-full text-center text-gray-500">No news articles found.</p>}
                {articles.map((article, index) => (
                    <a href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="block bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <img 
                            src={article.urlToImage || '/default-news-image.png'}
                            alt={article.title} 
                            className="w-full h-40 object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src='/default-news-image.png'; }}
                        />
                        <div className="p-4">
                            <h3 className="font-bold text-md mb-2 text-gray-800 hover:text-blue-600">{article.title}</h3>
                            {article.description && <p className="text-gray-600 text-sm mb-3 leading-relaxed">{article.description.substring(0, 100)}...</p>}
                            <div className="text-xs text-gray-500">
                                <span>{article.source.name}</span> | <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default FinancialNews;