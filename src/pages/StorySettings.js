import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Correct import from react-router-dom
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import queryString from 'query-string';

export default function StorySettings() {
  const navigate = useNavigate(); // Use navigate at the top level
  const location = useLocation(); // Use location at the top level

  const [emails, setEmails] = useState([{ address: '', isNotUserAddress: false }]);
  const [promptType, setPromptType] = useState('standard');
  const [customPrompt, setCustomPrompt] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Log cookies and tokens for debugging
    console.log("Cookies:", document.cookie);
    const accessToken = localStorage.getItem('access_token');
    console.log("Access Token:", accessToken);

    // Parse query parameters to check authentication status
    const params = queryString.parse(location.search);

    if (params.auth === 'true') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard'); // Clear URL query params by redirecting
    }

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      console.log("param auth:", params.auth)
      //navigate('/');
    }

    // Fetch CSRF token
    const getCSRFToken = async () => {
      const response = await axios.get('https://127.0.0.1:8000/users/csrf-token/', { withCredentials: true });
      setCsrfToken(response.data.csrfToken);
    };
    getCSRFToken();

    // Fetch initial settings data
    axios.get('https://127.0.0.1:8000/users/settings/', { withCredentials: true })
      .then((response) => {
        const { emailSettings, promptType, customPrompt, preferredName, pronouns } = response.data;
        setEmails(emailSettings);
        setPromptType(promptType);
        setCustomPrompt(customPrompt);
        setPreferredName(preferredName);
        setPronouns(pronouns);
      })
      .catch((error) => {
        console.error('Failed to load settings:', error);
      });
  }, [location, navigate]); // Dependencies include location and navigate

  const addEmailField = () => {
    setEmails([...emails, { address: '', isNotUserAddress: false }]);
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index].address = value;
    setEmails(newEmails);
  };

  const handleIsNotUserAddressChange = (index) => {
    const newEmails = [...emails];
    newEmails[index].isNotUserAddress = !newEmails[index].isNotUserAddress;
    setEmails(newEmails);
  };

  const removeEmailField = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const handlePromptTypeChange = (event) => {
    setPromptType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Send updated settings to the backend
      await axios.put(
        'https://127.0.0.1:8000/users/settings/',
        {
          emailSettings: emails,
          promptType,
          customPrompt,
          preferredName,
          pronouns,
        },
        {
          headers: {
            'X-CSRFToken': csrfToken, // Add CSRF token to the headers
          },
          withCredentials: true, // Send cookies for authentication
        }
      );

      alert('Settings updated successfully!');
      navigate('/dashboard'); // Redirect to dashboard after saving
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 font-sans flex flex-col">
      <header className="border-b border-gray-200 py-4 px-6 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-gray-600 hover:text-[#FFC0CB] transition-colors transform hover:scale-110">
            <ArrowLeft className="w-6 h-6" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-['VT323',monospace]">Story Settings</h1>
          <div className="w-6 h-6"></div>
        </div>
      </header>
      <main className="flex-grow px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="border-2 border-gray-300 rounded-2xl p-6 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:shadow-[#FFC0CB]/20">
            <div className="space-y-6">
              <div>
                <label htmlFor="preferred-name" className="block text-sm font-medium text-gray-700 font-['VT323',monospace]">Preferred Name</label>
                <input
                  type="text"
                  id="preferred-name"
                  name="preferred-name"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#FFC0CB] focus:ring focus:ring-[#FFC0CB] focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700 font-['VT323',monospace]">Pronouns</label>
                <select
                  id="pronouns"
                  name="pronouns"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#FFC0CB] focus:ring focus:ring-[#FFC0CB] focus:ring-opacity-50"
                >
                  <option value="">Select pronouns</option>
                  <option value="he/him">He/Him</option>
                  <option value="she/her">She/Her</option>
                  <option value="they/them">They/Them</option>
                  <option value="it/its">It/Its</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-['VT323',monospace]">Prompt Type</label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="prompt-type"
                      value="standard"
                      checked={promptType === 'standard'}
                      onChange={handlePromptTypeChange}
                      className="rounded border-gray-300 text-[#FFC0CB] shadow-sm focus:border-[#FFC0CB] focus:ring focus:ring-[#FFC0CB] focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600 font-['VT323',monospace]">Standard Prompt</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="prompt-type"
                      value="personalized"
                      checked={promptType === 'personalized'}
                      onChange={handlePromptTypeChange}
                      className="rounded border-gray-300 text-[#FFC0CB] shadow-sm focus:border-[#FFC0CB] focus:ring focus:ring-[#FFC0CB] focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600 font-['VT323',monospace]">Personalized Prompt</span>
                  </label>
                </div>
                {promptType === 'personalized' && (
                  <div className="mt-4">
                    <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 font-['VT323',monospace]">Customize Your Prompt</label>
                    <textarea
                      id="custom-prompt"
                      name="custom-prompt"
                      rows={3}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#FFC0CB] focus:ring focus:ring-[#FFC0CB] focus:ring-opacity-50"
                      placeholder="Start with the standard prompt: 'Once upon a time, in a world unlike our own...'"
                    ></textarea>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['VT323',monospace]">Email Addresses for Story Delivery</label>
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="email"
                      value={email.address}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="flex-grow rounded-md border border-gray-300 shadow-sm focus:border-[#FFC0CB] focus:ring focus:ring-[#FFC0CB] focus:ring-opacity-50"
                      placeholder="Enter email address"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={email.isNotUserAddress}
                        onChange={() => handleIsNotUserAddressChange(index)}
                        className="rounded border-gray-300 text-[#FFC0CB] shadow-sm focus:border-[#FFC0CB] focus:ring focus:ring-[#FFC0CB] focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 font-['VT323',monospace]">Not my address</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      className="text-red-500 hover:text-[#FFC0CB] transition-colors transform hover:scale-110"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEmailField}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-[#FFC0CB] transition-colors transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="font-['VT323',monospace]">Add another email</span>
                </button>
              </div>
            </div>
            <div className="mt-8">
              <button type="submit" className="w-full flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 hover:shadow-[#FFC0CB]/20">
                <Save className="w-5 h-5 mr-2" />
                <span className="font-['VT323',monospace]">Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 bg-white/80 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} MyStory. All rights reserved.</p>
      </footer>
    </div>
  );
}
