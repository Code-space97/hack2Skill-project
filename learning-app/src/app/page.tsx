"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, BrainCircuit, BookOpen, Layers, LibrarySquare, HelpCircle, CheckCircle2, MessageCircle, Send } from "lucide-react";

type Message = { role: "user" | "model", content: string };

export default function Home() {
  const [step, setStep] = useState(1);
  const [content, setContent] = useState("");
  const [intent, setIntent] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Tab state for the structured output
  const [activeTab, setActiveTab] = useState<"summary"|"flashcards"|"quizzes"|"chat">("summary");

  // Quiz State tracking
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const handleGenerate = async () => {
    if (!content || !intent) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, intent }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setQuizAnswers({}); // Reset quizzes for new generation
        setChatMessages([{ role: "model", content: "Hi! I'm your AI Tutor. I've analyzed your material. Do you have any questions or areas you'd like me to explain further?" }]);
        setStep(3);
        setActiveTab("summary");
      } else {
        alert("Error generating content: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reach server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentChatInput.trim() || chatLoading) return;
    
    const newMessages: Message[] = [...chatMessages, { role: "user", content: currentChatInput }];
    setChatMessages(newMessages);
    setCurrentChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: content, messages: newMessages }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages([...newMessages, { role: "model", content: data.text }]);
      } else {
        alert("Chat error: " + data.error);
      }
    } catch(err) {
       console.error("Chat failure");
    } finally {
       setChatLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Added pb-2 to prevent 'g' from being cut off */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 z-10 flex items-center gap-3 pb-2 pt-2">
        <BrainCircuit className="w-10 h-10 text-emerald-400 flex-shrink-0" /> AI Learning Hub
      </h1>
      <p className="text-gray-400 mb-12 text-center max-w-lg z-10">
        Instantly transform raw material into interactive flashcards, quizzes, and engage with your personal AI Tutor.
      </p>

      <div className="w-full max-w-4xl glassmorphism rounded-3xl p-8 shadow-2xl relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CONTENT */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4 max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="text-blue-400 w-6 h-6" /> What are you studying today?
              </h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your notes, PDF text, or articles here..."
                className="w-full h-56 bg-gray-900/50 border border-gray-700 rounded-xl p-5 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
              />
              <button
                onClick={() => content.trim() && setStep(2)}
                disabled={!content.trim()}
                className="self-end px-8 py-3.5 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: INTENT */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col gap-4 max-w-2xl mx-auto"
            >
              <button onClick={() => setStep(1)} className="text-sm text-gray-400 self-start hover:text-white transition-colors">&larr; Back to Text</button>
              <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2 mt-2">
                <Sparkles className="text-fuchsia-400 w-6 h-6" /> How do you want this simplified?
              </h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  "Explain like I'm 5", 
                  "Focus on key formulas", 
                  "Extremely detailed breakdown", 
                  "Just give me practice questions",
                  "Create an engaging story"
                ].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setIntent(preset)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${intent === preset ? 'bg-fuchsia-600/20 border-fuchsia-400 text-fuchsia-300' : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-400 hover:text-gray-200'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Or type your own custom strategy here..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-fuchsia-500 outline-none"
              />
              <button
                onClick={handleGenerate}
                disabled={!intent.trim() || loading}
                className="mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:opacity-90 transition-opacity rounded-xl font-bold text-lg w-full flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? "Analyzing Context & Generating Magic..." : (
                  <>Generate Learning Assets <Sparkles className="w-5 h-5" /></>
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 3: HIGH-END STRUCTURED RESULTS */}
          {step === 3 && result && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6"
            >
               <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                 <div>
                   <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 pb-1">Your Learning Dashboard</h2>
                   <p className="text-sm text-gray-400 mt-1">Custom generated using: {intent}</p>
                 </div>
                 <button onClick={() => setStep(1)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors">Start New Analysis</button>
               </div>

               {/* TABS MENU */}
               <div className="flex gap-2 p-1 bg-gray-900/80 rounded-xl border border-gray-800 w-full overflow-x-auto custom-scrollbar">
                 <button 
                    onClick={() => setActiveTab("summary")}
                    className={`shrink-0 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${activeTab === 'summary' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
                 >
                   <Layers className="w-4 h-4"/> Summary & Mindmap
                 </button>
                 <button 
                    onClick={() => setActiveTab("flashcards")}
                    className={`shrink-0 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${activeTab === 'flashcards' ? 'bg-amber-500/20 text-amber-400 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
                 >
                   <LibrarySquare className="w-4 h-4"/> Flashcards ({result.flashcards?.length || 0})
                 </button>
                 <button 
                    onClick={() => setActiveTab("quizzes")}
                    className={`shrink-0 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${activeTab === 'quizzes' ? 'bg-fuchsia-500/20 text-fuchsia-400 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
                 >
                   <HelpCircle className="w-4 h-4"/> Quizzes ({result.quizzes?.length || 0})
                 </button>
                 <div className="flex-1 min-w-[20px]" /> {/* Spacer */}
                 <button 
                    onClick={() => setActiveTab("chat")}
                    className={`shrink-0 px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all ${activeTab === 'chat' ? 'bg-blue-600 border border-blue-500 text-white shadow-lg' : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'}`}
                 >
                   <MessageCircle className="w-4 h-4"/> Ask Tutor
                 </button>
               </div>

               {/* TAB CONTENTS */}
               <div className="bg-gray-900/40 border border-gray-800 rounded-2xl min-h-[450px] relative overflow-hidden">
                 
                 {/* SUMMARY TAB */}
                 {activeTab === "summary" && (
                   <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6 p-6 h-[450px] overflow-y-auto">
                     <h3 className="text-xl font-semibold text-emerald-400 border-b border-gray-800 pb-2">Key Takeaways</h3>
                     <div className="space-y-4">
                       {result.summary?.map((p: string, i: number) => (
                         <div key={i} className="flex gap-4 items-start bg-gray-800/30 p-4 rounded-xl border border-gray-800/50">
                           <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">{i+1}</div>
                           <p className="text-gray-200 leading-relaxed text-lg">{p}</p>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {/* FLASHCARDS TAB */}
                 {activeTab === "flashcards" && (
                   <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6 p-6 h-[450px] overflow-y-auto">
                     <h3 className="text-xl font-semibold text-amber-400 border-b border-gray-800 pb-2">Interactive Flashcards</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {result.flashcards?.map((card: any, i: number) => (
                         <div key={i} className="group perspective-1000">
                           <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg min-h-[160px] flex flex-col justify-center relative overflow-hidden transition-all hover:border-amber-500/50">
                             <div className="absolute top-3 left-4 text-xs font-bold tracking-wider text-amber-500/50 uppercase">Question {i+1}</div>
                             <div className="text-lg font-medium text-gray-100 mt-4 mb-4 text-center">{card.front}</div>
                             
                             <div className="absolute inset-0 bg-amber-900/90 backdrop-blur-sm p-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                               <div className="text-center w-full overflow-y-auto">
                                  <div className="text-xs font-bold tracking-wider text-amber-300/70 uppercase mb-2">Answer</div>
                                  <div className="text-amber-50 font-medium">{card.back}</div>
                               </div>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                     <p className="text-center text-sm text-gray-500 mt-4">Hover over a flashcard to reveal the answer.</p>
                   </motion.div>
                 )}

                 {/* QUIZZES TAB */}
                 {activeTab === "quizzes" && (
                   <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8 p-6 h-[450px] overflow-y-auto">
                     <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <h3 className="text-xl font-semibold text-fuchsia-400">Knowledge Check</h3>
                        <p className="text-sm text-gray-400">Select an answer to reveal correctness.</p>
                     </div>
                     
                     <div className="space-y-8">
                       {result.quizzes?.map((quiz: any, i: number) => {
                         const hasAnswered = quizAnswers[i] !== undefined;

                         return (
                           <div key={i} className="bg-gray-800/20 p-6 rounded-xl border border-gray-800">
                             <h4 className="text-lg font-medium text-gray-100 mb-6 flex gap-3">
                               <span className="text-fuchsia-400 font-bold whitespace-nowrap">Q{i+1}.</span> 
                               {quiz.question}
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               {quiz.options?.map((opt: string, optIdx: number) => {
                                 const isCorrect = optIdx === quiz.correctIndex;
                                 const isSelected = quizAnswers[i] === optIdx;
                                 
                                 let btnClass = "border-gray-700 bg-gray-900/50 hover:bg-gray-800 text-gray-300 cursor-pointer";
                                 
                                 // Interactive Feedback coloring
                                 if (hasAnswered) {
                                  if (isCorrect) {
                                    // Make the correct answer immediately obvious and green
                                    btnClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-100 cursor-default";
                                  } else if (isSelected && !isCorrect) {
                                    // If user selected this and it's wrong, make it red
                                    btnClass = "border-red-500/50 bg-red-500/10 text-red-100 cursor-default";
                                  } else {
                                    // Other unchosen incorrect answers fade out
                                    btnClass = "border-gray-800 bg-gray-900/30 text-gray-500 opacity-40 cursor-default";
                                  }
                                 }

                                 return (
                                   <div 
                                     key={optIdx} 
                                     onClick={() => {
                                       if (!hasAnswered) {
                                         setQuizAnswers(prev => ({ ...prev, [i]: optIdx }));
                                       }
                                     }}
                                     className={`p-4 rounded-lg border transition-all ${btnClass}`}
                                   >
                                     <div className="flex justify-between items-center">
                                        <span>{opt}</span>
                                        {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </motion.div>
                 )}

                 {/* CHAT TAB */}
                 {activeTab === "chat" && (
                   <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col h-[450px]">
                     
                     {/* Chat Messages Area */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-4">
                       {chatMessages.map((msg, idx) => (
                         <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'}`}>
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                           </div>
                         </div>
                       ))}
                       {chatLoading && (
                         <div className="flex justify-start">
                           <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                           </div>
                         </div>
                       )}
                       <div ref={chatEndRef} />
                     </div>

                     {/* Chat Input Area */}
                     <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                       <form 
                         onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                         className="flex gap-2"
                       >
                         <input
                           type="text"
                           value={currentChatInput}
                           onChange={(e) => setCurrentChatInput(e.target.value)}
                           disabled={chatLoading}
                           placeholder="Ask the Tutor anything about this material..."
                           className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                         />
                         <button 
                           type="submit"
                           disabled={!currentChatInput.trim() || chatLoading}
                           className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 rounded-xl flex items-center justify-center transition-colors"
                         >
                           <Send className="w-5 h-5" />
                         </button>
                       </form>
                     </div>

                   </motion.div>
                 )}

               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
