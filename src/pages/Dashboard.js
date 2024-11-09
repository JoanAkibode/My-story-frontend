import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import axios from 'axios';
import queryString from 'query-string';
import Switch from 'react-switch';

// Helper function to get CSRF token
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return null;
}

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isStoryOn, setIsStoryOn] = useState(true);
    const [deactivatedEvents, setDeactivatedEvents] = useState([]);

    // Toggle function for ON/OFF button
    const handleToggle = () => {
        setIsStoryOn(!isStoryOn);
    };

    // Function to toggle event wanted status
    const toggleEventWantedStatus = async (eventId, currentStatus, index) => {
        try {
            await axios.post('https://127.0.0.1:8000/calendar/change-wanted-status/', {
                event_id: eventId,
                wanted_by_the_user: !currentStatus
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                }
            });

            // Update local state to reflect change
            setDeactivatedEvents((prev) =>
                prev.includes(index) ? prev.filter((idx) => idx !== index) : [...prev, index]
            );

            console.log(`Event ${eventId} status updated successfully.`);
        } catch (error) {
            console.error('Failed to update event status:', error);
        }
    };

    useEffect(() => {
        const fetchEventsAndStories = async () => {
            try {
                const response = await axios.get('https://127.0.0.1:8000/calendar/events/', { withCredentials: true });
                console.log("Events fetched successfully");

                const nextStoryResponse = await axios.get('https://127.0.0.1:8000/calendar/next-story-events/', {
                    withCredentials: true,
                    headers: { 'X-CSRFToken': getCSRFToken() },
                });
                console.log("Next story fetched successfully");
                setEvents(nextStoryResponse.data.events);
                setLoading(false);
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.log("Rate limit exceeded. Moving to next story...");
                    try {
                        const rateLimitedResponse = await axios.get('https://127.0.0.1:8000/calendar/next-story-events/', {
                            withCredentials: true,
                            headers: { 'X-CSRFToken': getCSRFToken() },
                        });
                        setEvents(rateLimitedResponse.data.events);
                    } catch (rateLimitedError) {
                        console.error('Error after rate limit:', rateLimitedError);
                        setError('Failed to load next story due to rate limiting. Please try again later.');
                    }
                } else if (error.response && error.response.status === 401) {
                    console.log("Not authenticated, redirecting to login...");
                    navigate('/');
                } else {
                    console.error('Error fetching events:', error);
                    setError('Failed to load events. Please try again later.');
                }
                setLoading(false);
            }
        };

        fetchEventsAndStories();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post('https://127.0.0.1:8000/auth/logout/', null, {
                withCredentials: true,
                headers: { 'X-CSRFToken': getCSRFToken() }
            });
            localStorage.removeItem('isAuthenticated');
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Logout failed. Please try again.');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 text-gray-800 font-sans flex flex-col">
            <header className="border-b border-gray-200 py-4 px-6 bg-white/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-['VT323',monospace]">MyStory</h1>
                    <div className="flex items-center">
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
                        <button onClick={handleLogout} className="ml-4 text-gray-600 hover:text-[#FFC0CB] transition-colors transform hover:scale-110">
                            <LogOut className="w-6 h-6" />
                            <span className="sr-only">Logout</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-grow px-6 py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="border-2 border-gray-300 rounded-2xl p-6 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:shadow-pink-300/20">
                        <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-['VT323',monospace]">Past Stories</h2>
                        <ul className="space-y-4">
                            {error ? (
                                <li className="text-red-500">{error}</li>
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

                    <section className="border-2 border-gray-300 rounded-2xl p-6 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:shadow-pink-300/20">
                        <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-['VT323',monospace]">Upcoming Events for Next Story</h2>
                        <ul className="space-y-4">
                            {error ? (
                                <li className="text-red-500">{error}</li>
                            ) : events.length > 0 ? (
                                events.map((event, index) => (
                                    <li
                                        key={index}
                                        className={`bg-gradient-to-r from-pink-50 to-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-pink-300/20 ${
                                            deactivatedEvents.includes(index) ? 'opacity-50' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800 font-['VT323',monospace]">{event.summary}</span>
                                                <span className="text-sm text-gray-600">
                                                    {new Date(event.start).toLocaleDateString()} {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - 
                                                    {new Date(event.end).toLocaleDateString()} {new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Switch
                                                    checked={!deactivatedEvents.includes(index)}
                                                    onChange={() => toggleEventWantedStatus(event.id, event.wanted_by_the_user, index)}
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
