import { useState, useEffect, useRef, useCallback } from 'react';

export const useVoiceAgent = () => {
    const [isListening, setIsListening] = useState(false);
    const [agentState, setAgentState] = useState('idle'); // idle, listening, thinking, speaking
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');

    const recognitionRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setAgentState('listening');
            };

            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                handleUserQuery(text);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (agentState === 'listening') {
                    setAgentState('idle');
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                setAgentState('idle');
            };
        }
    }, []);

    const speak = useCallback((text) => {
        if (synthesisRef.current) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Try to select a "premium" voice if available
            const voices = synthesisRef.current.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onstart = () => setAgentState('speaking');
            utterance.onend = () => setAgentState('idle');

            synthesisRef.current.speak(utterance);
        }
    }, []);

    const handleUserQuery = async (text) => {
        setAgentState('thinking');

        // Simulate processing delay
        setTimeout(() => {
            let reply = "I'm here to help you write your masterpiece.";

            if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
                reply = "Hello! I am Muse, your personal writing companion. How can I assist you today?";
            } else if (text.toLowerCase().includes('idea') || text.toLowerCase().includes('stuck')) {
                reply = "Writer's block is natural. Let's try a writing prompt. Describe the smell of your protagonist's childhood home.";
            } else if (text.toLowerCase().includes('character')) {
                reply = "Characters are the heart of your story. Tell me about their greatest fear.";
            } else if (text.toLowerCase().includes('search') || text.toLowerCase().includes('google')) {
                reply = "I can help you find information. What topic shall we research together?";
            }

            setResponse(reply);
            speak(reply);
        }, 1500);
    };

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        } else {
            alert("Speech recognition not supported in this browser.");
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        agentState,
        transcript,
        response,
        toggleListening
    };
};
