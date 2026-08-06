import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, MessageSquare, AlertCircle, Play, Info } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your AI project assistant. Ask me details about employees, projects, tasks, or expenses. You can also use voice commands to save data!
      <br/><br/>
      <strong>📋 Possible Commands:</strong>
      <ul class="list-disc pl-5 mt-1.5 space-y-1">
        <li><strong>Todos / Tasks:</strong> Try asking <em>"what is my tasks?"</em> or <em>"todos"</em></li>
        <li><strong>Project Status:</strong> Try asking <em>"what is active projects?"</em> or <em>"project status"</em></li>
        <li><strong>Purchases / Expenses:</strong> Try asking <em>"show recent purchases"</em> or <em>"expenses"</em></li>
        <li><strong>Employees / Staff:</strong> Try asking <em>"list all employees"</em> or <em>"staff roster"</em></li>
      </ul>
      <br/>
      <strong>🎙️ Voice Command Quick Logging:</strong>
      <ul class="list-disc pl-5 mt-1.5 space-y-1">
        <li>Say/Type <strong>'task is [task name]'</strong> (e.g. <em>'task is goto marking'</em>) to save a task</li>
        <li>Say/Type <strong>'expense is [category] [amount]'</strong> (e.g. <em>'expense is food 200'</em>) to save a purchase</li>
      </ul>`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [alwaysOn, setAlwaysOn] = useState(true);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const speakEnabledRef = useRef(speakEnabled);
  const isListeningRef = useRef(isListening);
  const alwaysOnRef = useRef(alwaysOn);
  const manualStopRef = useRef(false);
  const manualModeActiveRef = useRef(false);

  useEffect(() => {
    speakEnabledRef.current = speakEnabled;
  }, [speakEnabled]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    alwaysOnRef.current = alwaysOn;
  }, [alwaysOn]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakAndListenActive = (replyText) => {
    const assistantMsg = {
      sender: 'assistant',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, assistantMsg]);

    if (speakEnabledRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = replyText.replace(/<\/?[^>]+(>|$)/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'hi-IN';
      utterance.onend = () => {
        setTimeout(() => {
          if (recognitionRef.current && !isListeningRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error(e);
            }
          }
        }, 400);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        if (recognitionRef.current && !isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error(e);
          }
        }
      }, 600);
    }
  };

  // Web Speech API: Speech-to-Text (SpeechRecognition) Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'hi-IN'; // Set to Hindi/English dual context support
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setError('');
      };

      rec.onresult = (event) => {
        const result = event.results[0][0].transcript;
        if (result) {
          const wakeWords = [
            'baby', 'hey baby', 'hello baby', 
            'hello assistant', 'hey assistant', 'assistant', 
            'jarvis', 'hey jarvis', 'ok google',
            'हे बेबी', 'बेबी', 'हेलो असिस्टेंट', 'सुनो बेबी'
          ];
          
          let lowerResult = result.trim().toLowerCase();
          
          // Check if user just said the wake word
          let matchedWake = false;
          for (const word of wakeWords) {
            if (lowerResult === word) {
              matchedWake = true;
              break;
            }
          }

          if (matchedWake) {
            setInput('');
            speakAndListenActive("Yes! I am listening. How can I help you?");
          } else {
            // Check if user said wake word + command (e.g. "hey baby what is my tasks")
            let matchedPrefix = false;
            let commandText = result;
            for (const word of wakeWords) {
              if (lowerResult.startsWith(word + ' ')) {
                commandText = result.substring(word.length + 1).trim();
                commandText = commandText.replace(/^[:,\-\s]+/, '');
                matchedPrefix = true;
                break;
              }
            }
            
            // If manual mic click is active, OR we matched the wake phrase prefix:
            if (manualModeActiveRef.current || matchedPrefix) {
              setInput(commandText);
              handleSendMessage(commandText);
            } else {
              console.log("Ignored background noise / speech (no wake word):", result);
            }
          }
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else {
          setError(`Voice input error: ${e.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        manualModeActiveRef.current = false; // Reset manual mode
        
        // Auto restart if alwaysOn is true and not manually stopped
        if (alwaysOnRef.current && !manualStopRef.current) {
          setTimeout(() => {
            try {
              if (!isListeningRef.current) {
                rec.start();
              }
            } catch (e) {
              console.error("Auto-restart failed:", e);
            }
          }, 300);
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Auto-start voice recognition on mount (if alwaysOn is enabled)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (recognitionRef.current && !isListeningRef.current && alwaysOnRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Initial auto-start failed:", e);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      setError('Web Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }
    if (isListening) {
      manualStopRef.current = true;
      manualModeActiveRef.current = false;
      recognitionRef.current.stop();
    } else {
      manualStopRef.current = false;
      manualModeActiveRef.current = true; // User manually started it, accept any input!
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop AI speaking when user starts talking
      }
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend) => {
    const promptText = (textToSend || input).trim();
    if (!promptText) return;

    // Append user message
    const userMsg = {
      sender: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await API.post('ai-assistant/', { prompt: promptText });
      
      const replyText = res.data.response || "No response received.";
      const assistantMsg = {
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);

      // Web Speech API: Text-to-Speech (SpeechSynthesis)
      if (speakEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Strip HTML tags for clean narration
        const cleanText = replyText.replace(/<\/?[^>]+(>|$)/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'hi-IN';
        window.speechSynthesis.speak(utterance);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to connect to the AI Assistant.');
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (text) => {
    handleSendMessage(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] space-y-4">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-white">Project Assistant AI</h3>
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${alwaysOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {alwaysOn ? 'Listening for "baby"...' : 'Voice commands online'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Always-on / Wake Word listener Toggle */}
          <button
            onClick={() => {
              const newVal = !alwaysOn;
              setAlwaysOn(newVal);
              if (!newVal && isListening) {
                manualStopRef.current = true;
                recognitionRef.current?.stop();
              } else if (newVal && !isListening) {
                manualStopRef.current = false;
                try {
                  recognitionRef.current?.start();
                } catch(e) {
                  console.error(e);
                }
              }
            }}
            title={alwaysOn ? "Disable Background Wake-Word Listening" : "Enable Background Wake-Word Listening"}
            className={`p-2.5 rounded-xl border transition-all flex items-center space-x-1.5 ${alwaysOn ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 border-slate-205 text-slate-400 dark:bg-slate-900 dark:border-slate-800'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${alwaysOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline">Wake Word (Baby)</span>
          </button>

          <button
            onClick={() => {
              setSpeakEnabled(!speakEnabled);
              if (speakEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            title={speakEnabled ? "Mute Narration" : "Enable Narration"}
            className={`p-2.5 rounded-xl border transition-all ${speakEnabled ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 border-slate-205 text-slate-400 dark:bg-slate-900 dark:border-slate-800'}`}
          >
            {speakEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Suggestion & Commands Panel */}
      <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-3 rounded-2xl flex items-center justify-between space-x-3 flex-shrink-0">
        <div className="flex items-start space-x-3">
          <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-slate-600 dark:text-slate-450 leading-relaxed font-semibold">
            <span className="font-bold text-amber-600 dark:text-amber-400">Voice command formatting:</span> saying <strong>"task is: setup drip pipes"</strong> creates a pending task; saying <strong>"expense is: fuel 400"</strong> logs a spend in transport.
          </div>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="text-[10px] md:text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex-shrink-0 whitespace-nowrap bg-indigo-500/5 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/10"
        >
          {showGuide ? "Hide Commands" : "View All Commands"}
        </button>
      </div>

      {/* Command Guide Panel */}
      {showGuide && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex-shrink-0 animate-in slide-in-from-top duration-200 text-xs text-slate-700 dark:text-slate-350 space-y-3 shadow-md">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="font-extrabold text-sm text-indigo-650 dark:text-indigo-400 flex items-center gap-1">
              <Sparkles size={16} />
              AI Command Reference Guide
            </span>
            <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">Close</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-1">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Data Logging Commands</h4>
              <ul className="space-y-2 list-disc pl-4 font-semibold">
                <li>
                  <strong className="text-indigo-650 dark:text-indigo-400">Create Task:</strong> <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850">"task is [Title]"</code> / <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850">"टास्क इस [काम]"</code>
                  <div className="text-[10px] text-slate-450 italic mt-0.5">Example: "task is check water quality" / "टास्क सेटअप ड्रिप पाइप"</div>
                </li>
                <li>
                  <strong className="text-indigo-650 dark:text-indigo-400">Log Daily Spend:</strong> <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850">"expense is [Category] [Amount]"</code> / <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850">"एक्सपेंस [काम] [रुपये]"</code>
                  <div className="text-[10px] text-slate-450 italic mt-0.5">Example: "expense is food 200" / "खर्चा 400"</div>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Information Queries</h4>
              <ul className="space-y-2 list-disc pl-4 font-semibold">
                <li>
                  <strong className="text-indigo-650 dark:text-indigo-400">View Tasks:</strong> Mention words like <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850">"task" / "pending" / "काम"</code>
                  <div className="text-[10px] text-slate-450 italic mt-0.5">Example: "what is my tasks?" / "काम दिखाओ"</div>
                </li>
                <li>
                  <strong className="text-indigo-650 dark:text-indigo-400">View Employees:</strong> Mention words like <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850">"employee" / "staff" / "कर्मचारी"</code>
                  <div className="text-[10px] text-slate-450 italic mt-0.5">Example: "list all staff" / "एम्प्लॉई बताओ"</div>
                </li>
                <li>
                  <strong className="text-indigo-650 dark:text-indigo-400">View Expenses & Purchases:</strong> Mention words like <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850">"expense" / "purchase" / "spend" / "खर्चा"</code>
                  <div className="text-[10px] text-slate-450 italic mt-0.5">Example: "show recent purchases" / "खर्चा बताओ"</div>
                </li>
                <li>
                  <strong className="text-indigo-650 dark:text-indigo-400">View Projects:</strong> Mention words like <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850">"project" / "प्रोजेक्ट"</code>
                  <div className="text-[10px] text-slate-450 italic mt-0.5">Example: "what is active projects?" / "प्रोजेक्ट बताओ"</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold bg-indigo-500/5 p-2.5 rounded-xl border border-indigo-500/10">
            💡 Supported Categories: food (meals/dinner/chai), rent (lease), transport (fuel/diesel/petrol), shopping (buy/purchase), health (medical/dawa), monthly expenses (utility/bill).
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner min-h-0 flex flex-col justify-between">
        
        <div className="space-y-4 flex-1">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed shadow-sm transition-all duration-200 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-650 text-white rounded-br-none'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-slate-200 rounded-bl-none'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                <span className={`text-[9px] block text-right mt-1.5 font-bold ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 py-1 flex-shrink-0">
        {[
          { label: '📊 System Status', text: 'Show a summary overview' },
          { label: '📋 Todos / Tasks', text: 'what is my tasks?' },
          { label: '🏗️ Project Status', text: 'Show active projects' },
          { label: '💳 Purchases & Expenses', text: 'Show recent purchases' },
          { label: '👥 Staff Roster', text: 'List all employees' }
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => selectSuggestion(chip.text)}
            className="text-[10px] md:text-xs font-bold px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 transition-all shadow-sm"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium flex-shrink-0">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Message Inputs Panel */}
      <div className="flex items-center space-x-2 flex-shrink-0 pb-safe">
        
        <button
          onClick={startVoiceInput}
          title={isListening ? "Stop Listening" : "Start Voice Input"}
          className={`p-3.5 rounded-xl border flex items-center justify-center transition-all duration-200 ${
            isListening 
              ? 'bg-rose-600 border-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 shadow-sm'
          }`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening... Speak now..." : "Ask AI a question or log data..."}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm transition-colors"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          className="p-3.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
        >
          <Send size={18} />
        </button>

      </div>

    </div>
  );
}
