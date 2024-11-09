import React, { useState, useEffect } from 'react';
import { LogIn, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function WelcomePage() {
  const [typedText, setTypedText] = useState('');
  const fullText = "Unlock stories that transform your everyday moments and turn your goals into reality...";
  const navigate = useNavigate();

  // Typing effect for the welcome message
  useEffect(() => {
    let i = 0;
    const typingEffect = () => {
      if (i < fullText.length) {
        setTypedText((prev) => prev + fullText.charAt(i));
        i++;
        setTimeout(typingEffect, Math.random() * 150 + 50); 
      }
    };
    typingEffect();

    return () => clearTimeout(typingEffect); // Clean up
  }, []);

  // Redirection logic if the user is already authenticated
  useEffect(() => {
    // const checkAuthentication = async () => {
    //   try {
    //     // Check if the user is authenticated with Django
    //     const djangoResponse = await axios.get('https://127.0.0.1:8000/auth/status/django/', {
    //       withCredentials: true,
    //     });

    //     // Check if the user is authenticated with Google
    //     const googleResponse = await axios.get('https://127.0.0.1:8000/auth/status/google/', {
    //       withCredentials: true,
    //     });

    //     // If both authentications are successful, redirect to the dashboard
    //     if (djangoResponse.data.is_authenticated && googleResponse.data.is_authenticated) {
    //       navigate('/dashboard');
    //     }
    //   } catch (error) {
    //     console.error('Error checking authentication status:', error);
    //   }
    // };

    // checkAuthentication();
  }, [navigate]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 text-gray-800 font-sans flex flex-col">
      <header className="border-b border-gray-200 py-4 px-6 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-['VT323',monospace]">
            MyStory
          </h1>
          <a
            href="https://127.0.0.1:8000/auth/google/init/"
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full border border-purple-300 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 hover:shadow-pink-300/50"
          >
            <LogIn className="w-5 h-5" />
            <span>Connect with Google</span>
          </a>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full text-center">
          <h2 className="text-5xl font-bold mb-8 text-gray-800 font-['VT323',monospace]">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">MyStory</span>
          </h2>
          <div className="border-2 border-gray-300 rounded-2xl p-6 bg-white shadow-xl mb-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:shadow-pink-300/20">
            <div className="bg-gradient-to-r from-pink-50 to-blue-50 p-6 rounded-xl min-h-[120px] flex items-center justify-center relative overflow-hidden">
              <div className="flex items-center w-full">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse mr-4 flex-shrink-0 hover:scale-110 transition-transform duration-300" />
                <p className="text-2xl text-left w-full font-medium text-gray-700 font-['VT323',monospace]">
                  {typedText}
                  <span className="inline-block w-0.5 h-8 bg-[#FFC0CB] ml-0.5 animate-pulse absolute"></span>
                </p>
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your Google Calendar to start transforming your events into captivating stories. Let your memories shine!
          </p>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 bg-white/80 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} MyStory. All rights reserved.</p>
      </footer>
    </div>
  );
}
