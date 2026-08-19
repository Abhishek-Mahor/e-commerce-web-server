import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const AIStylist = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [occasion, setOccasion] = useState('');
  const [weather, setWeather] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickOccasions = ['Casual Hangout', 'Wedding Party', 'Formal Office', 'Romantic Date', 'Gym & Workout', 'Beach Day'];
  const quickWeathers = ['Sunny & Hot', 'Chilly & Cold', 'Rainy & Wet', 'Windy & Breezy', 'Humid & Sticky'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!occasion.trim() || !weather.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestion('');
    setRecommendedProducts([]);

    try {
      const response = await axios.post(`${backend_url}/api/stylist/suggest`, {
        occasion,
        weather
      });

      if (response.data && response.data.success) {
        setSuggestion(response.data.clothsuggestion);
        setRecommendedProducts(response.data.recommendedProducts || []);
      } else {
        setError(response.data.message || 'Failed to get recommendation. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatSuggestion = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      let content = line.trim();
      if (!content) return <div key={index} className="h-2" />;
      
      // Headers
      if (content.startsWith('###')) {
        return (
          <h4 key={index} className="text-base font-bold text-indigo-900 mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            {content.replace('###', '').trim()}
          </h4>
        );
      }
      if (content.startsWith('##')) {
        return (
          <h3 key={index} className="text-lg font-bold text-indigo-950 mt-6 mb-3 border-b border-indigo-100 pb-1">
            {content.replace('##', '').trim()}
          </h3>
        );
      }
      if (content.startsWith('#')) {
        return (
          <h2 key={index} className="text-xl font-extrabold text-indigo-950 mt-6 mb-4">
            {content.replace('#', '').trim()}
          </h2>
        );
      }

      // Bullet points
      if (content.startsWith('-') || content.startsWith('*')) {
        const formatted = content.substring(1).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <li key={index} className="ml-4 list-disc text-gray-700 my-1.5 leading-relaxed text-sm" 
              dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }

      // Normal paragraphs
      const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p key={index} className="text-gray-700 my-2 leading-relaxed text-sm" 
           dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-linear-to-r from-indigo-50 via-white to-purple-50 text-gray-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 grow w-full">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 bg-indigo-100/70 rounded-full uppercase">
            AI Fashion Assistant
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mt-3 sm:text-5xl">
            AI Personal Stylist
          </h1>
          <p className="max-w-2xl mx-auto text-base text-gray-600 mt-3">
            Get personalized, high-fashion outfit recommendations using Gemini AI, integrated directly with our latest collection catalog.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Form Panel */}
          <div className="md:col-span-5 bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-50/50 shadow-xl shadow-indigo-100/30 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 0 2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1-1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 5.043-.025m-11.362-3.2a15.998 15.998 0 0 1-3.2-5.043m11.362 3.2a15.997 15.997 0 0 0 .025-5.043m-9.619 9.62A15.997 15.997 0 0 1 6.57 9.53m11.362 3.2a15.998 15.998 0 0 0 1.622-3.395m0 0a15.998 15.998 0 0 0-3.388-1.62m3.388 1.62a15.997 15.997 0 0 1 3.2 5.043m-1.622-3.395a15.998 15.998 0 0 0-5.043-.025m-3.388-1.62a15.998 15.998 0 0 1-1.622-3.395m0 0a15.997 15.997 0 0 1 3.388-1.62m-3.388 1.62a15.998 15.998 0 0 0-3.2 5.043m5.01-11.712a1.5 1.5 0 1 1-3-.087 1.5 1.5 0 0 1 3 .087ZM11.89 13.711a9.01 9.01 0 0 1 3.388-1.62m-3.388 1.62a9.01 9.01 0 0 0-1.622-3.395m0 0a9.01 9.01 0 0 0-3.388-1.62m3.388 1.62a9.01 9.01 0 0 1 1.622-3.395m0 0a9.01 9.01 0 0 1 3.388-1.62m-3.388 1.62a9.01 9.01 0 0 0 1.622 3.395m0 0a9.01 9.01 0 0 0 3.388 1.62m-3.388-1.62a9.01 9.01 0 0 1-1.622 3.395Z" />
              </svg>
              Outfit Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Occasion Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Occasion
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer party, Job interview"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50"
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickOccasions.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOccasion(o)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-all cursor-pointer"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Weather
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rainy and cold, Sunny and 30°C"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50"
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickWeathers.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeather(w)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-all cursor-pointer"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 text-xs bg-red-50 border border-red-100 text-red-600 rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all ${
                  loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Curating your look...</span>
                  </div>
                ) : (
                  'Get Outfit Suggestion'
                )}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-7 bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-50/50 shadow-xl shadow-indigo-100/30 p-6 min-h-100 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21m0 0-.813-5.096L3 15.094m6 5.906 1.813-5.096L15 15.094M12 3v13m0-13L8.625 6.375M12 3l3.375 3.375" />
              </svg>
              Your Style Board
            </h2>

            {loading ? (
              <div className="grow flex flex-col items-center justify-center py-12 text-center">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
                </div>
                <p className="text-sm font-semibold text-gray-800">Formulating suggestions...</p>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Our AI is browsing our catalog of available products to match colors and styles for your occasion.
                </p>
              </div>
            ) : suggestion ? (
              <div className="grow overflow-y-auto space-y-6 max-h-150 pr-2 scrollbar-thin scrollbar-thumb-indigo-100 scrollbar-track-transparent">
                {/* Style Details */}
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/40 text-xs text-indigo-800 flex flex-col gap-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-600">Request details</span>
                    <span>Occasion: <strong>{occasion}</strong> • Weather: <strong>{weather}</strong></span>
                  </div>
                  <div className="prose prose-indigo max-w-none text-gray-700">
                    {formatSuggestion(suggestion)}
                  </div>
                </div>

                {/* Recommended Products Grid */}
                {recommendedProducts.length > 0 && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      Featured Catalog Matches
                    </h3>
                    <div className="flex flex-wrap gap-4 justify-start">
                      {recommendedProducts.map((product) => (
                        <ProductCard
                          key={product._id}
                          id={product._id}
                          name={product.name}
                          price={product.price}
                          description={`${product.color} • Size ${product.size}`}
                          image={product.image || 'https://via.placeholder.com/150'}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grow flex flex-col items-center justify-center text-center py-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-indigo-100 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">No suggestions yet</p>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Enter an occasion and weather in the form to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIStylist;