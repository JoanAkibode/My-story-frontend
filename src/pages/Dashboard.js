import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Settings, LogOut, Edit2 } from 'lucide-react';
import axios from 'axios';
import queryString from 'query-string';
import Switch from 'react-switch'; // Import the Switch component

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [stories, setStories] = useState([]); // For past stories
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State to handle errors
    const [isStoryOn, setIsStoryOn] = useState(true); // Toggle state for ON/OFF button
    const [deactivatedEvents, setDeactivatedEvents] = useState([]); // Track deactivated events

    // Toggle function for ON/OFF button
    const handleToggle = () => {
        setIsStoryOn(!isStoryOn);
    };

    // Toggle individual events on or off for the story
    const toggleEvent = (eventIndex) => {
        setDeactivatedEvents((prev) =>
            prev.includes(eventIndex)
                ? prev.filter((index) => index !== eventIndex) // Remove from deactivated
                : [...prev, eventIndex] // Add to deactivated
        );
    };

    useEffect(() => {
        // Log cookies and tokens for debugging
        console.log("Cookies:", document.cookie);
        const accessToken = localStorage.getItem('access_token');
        console.log("Access Token:", accessToken);

        // Check authentication status
        const params = queryString.parse(location.search);

        // Check authentication from query parameters and update localStorage if necessary
        if (params.auth === 'true') {
            console.log('auth params:', params.auth);
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/dashboard'); // Clear URL query params by redirecting
        }

        // Verify if the user is authenticated
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            console.log('Not authenticated');
            navigate('/');
        }

        // Fetch events and stories from the backend

        axios.get('http://localhost:8000/rest/v1/calendar/next-story-events/', { withCredentials: true })
            .then(response => {
                setEvents(response.data.events); // These will only be the "next story" events
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching next story events:', error);
                setError('Failed to load events. Please try again later.');
                setLoading(false);
            });    

        // Fetch past stories (commented out for now)
        // axios.get('http://localhost:8000/rest/v1/calendar/stories/', { withCredentials: true })
        //     .then(response => {
        //         setStories(response.data.stories);
        //         setLoading(false);
        //     })
        //     .catch(error => {
        //         console.error('Error fetching stories:', error);
        //         setError('Failed to load stories. Please try again later.');
        //         setLoading(false);
        //     });
    }, [location, navigate]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 text-gray-800 font-sans flex flex-col">
            <header className="border-b border-gray-200 py-4 px-6 bg-white/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-['VT323',monospace]">MyStory</h1>
                    <div className="flex items-center">
                        {/* Rectangular Toggle */}
                        <Switch
                            checked={isStoryOn}
                            onChange={handleToggle}
                            offColor="#FF5A5F"
                            onColor="#4CAF50"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={24}
                            width={48}
                            handleDiameter={20}
                        />
                        <span className="ml-3 text-sm font-medium">{isStoryOn ? 'Story ON' : 'Story OFF'}</span>
                        <Link to="/story-settings" className="ml-4 text-gray-600 hover:text-[#FFC0CB] transition-colors transform hover:scale-110">
                            <Settings className="w-6 h-6" />
                            <span className="sr-only">Story Settings</span>
                        </Link>
                        <Link to="/logout" className="ml-4 text-gray-600 hover:text-[#FFC0CB] transition-colors transform hover:scale-110">
                            <LogOut className="w-6 h-6" />
                            <span className="sr-only">Logout</span>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-grow px-6 py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side - Past Stories */}
                    <section className="border-2 border-gray-300 rounded-2xl p-6 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:shadow-pink-300/20">
                        <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-['VT323',monospace]">Past Stories</h2>
                        <ul className="space-y-4">
                            {error ? (
                                <li className="text-red-500">{error}</li> // Display error message if there's an error
                            ) : stories.length > 0 ? (
                                stories.map((story, index) => (
                                    <li key={index} className="bg-gradient-to-r from-pink-50 to-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-pink-300/20">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800 font-['VT323',monospace]">{story.title}</span>
                                            <span className="text-sm text-gray-600">{new Date(story.date).toLocaleDateString()}</span>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-600">No stories found</li>
                            )}
                        </ul>
                    </section>

                    {/* Right side - Upcoming Events */}
                    <section className="border-2 border-gray-300 rounded-2xl p-6 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:shadow-pink-300/20">
                        <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-['VT323',monospace]">Upcoming Events for Next Story</h2>
                        <ul className="space-y-4">
                            {error ? (
                                <li className="text-red-500">{error}</li> // Display error message if there's an error
                            ) : events.length > 0 ? (
                                events.map((event, index) => (
                                    <li
                                        key={index}
                                        className={`bg-gradient-to-r from-pink-50 to-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-pink-300/20 ${
                                            deactivatedEvents.includes(index) ? 'opacity-50' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800 font-['VT323',monospace]">{event.summary}</span>
                                            {/* Edit button and event toggle */}
                                            <div className="flex items-center space-x-4">
                                                <button className="text-gray-600 hover:text-blue-600">
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <Switch
                                                    checked={!deactivatedEvents.includes(index)}
                                                    onChange={() => toggleEvent(index)}
                                                    offColor="#FF5A5F"
                                                    onColor="#4CAF50"
                                                    uncheckedIcon={false}
                                                    checkedIcon={false}
                                                    height={20}
                                                    width={40}
                                                    handleDiameter={18}
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-600">No events found</li>
                            )}
                        </ul>
                    </section>
                </div>
            </main>
            <footer className="text-center py-6 text-sm text-gray-500 bg-white/80 backdrop-blur-sm">
                <p>&copy; {new Date().getFullYear()} MyStory. All rights reserved.</p>
            </footer>
        </div>
    );
}
