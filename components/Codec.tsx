
import React, { useState, useEffect } from 'react';
import { getRadioDialogue } from '../services/geminiService';

interface CodecProps {
  onClose: () => void;
  situation: string;
}

const Codec: React.FC<CodecProps> = ({ onClose, situation }) => {
  const [message, setMessage] = useState<string>("Initializing secure link...");
  const [frequency] = useState("140.85");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDialogue = async () => {
      try {
        const text = await getRadioDialogue(situation);
        setMessage(text);
      } catch (error) {
        setMessage("Connection lost. Intermittent jamming detected.");
      } finally {
        setLoading(false);
      }
    };
    fetchDialogue();
  }, [situation]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 font-orbitron text-blue-400 p-4 md:p-8">
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4 md:gap-12 items-center">
        {/* Operative Side */}
        <div className="flex flex-col items-center space-y-2 md:space-y-4">
          <div className="w-32 h-40 md:w-64 md:h-80 bg-blue-900/20 border-2 border-blue-400 flex flex-col overflow-hidden relative">
            <img 
              src="https://picsum.photos/seed/snake/300/400" 
              alt="Operative" 
              className="w-full h-full object-cover grayscale brightness-50 contrast-150"
            />
            <div className="absolute bottom-0 w-full bg-blue-400/80 text-black px-1 md:px-2 py-0.5 md:py-1 font-bold text-center text-[10px] md:text-base">
              KAPTEN
            </div>
            <div className="absolute inset-0 pointer-events-none border-[8px] md:border-[16px] border-black/20" />
            <div className="absolute top-1 left-1 md:top-2 md:left-2 flex gap-0.5 md:gap-1 h-2 md:h-4 items-end">
                <div className="w-0.5 md:w-1 h-full bg-blue-400" />
                <div className="w-0.5 md:w-1 h-4/5 bg-blue-400" />
                <div className="w-0.5 md:w-1 h-3/5 bg-blue-400" />
            </div>
          </div>
        </div>

        {/* Support Side */}
        <div className="flex flex-col items-center space-y-2 md:space-y-4">
          <div className="w-32 h-40 md:w-64 md:h-80 bg-green-900/20 border-2 border-green-400 flex flex-col overflow-hidden relative">
            <img 
              src="https://picsum.photos/seed/col/300/400" 
              alt="Commander" 
              className="w-full h-full object-cover grayscale brightness-50 contrast-150"
            />
             <div className="absolute bottom-0 w-full bg-green-400/80 text-black px-1 md:px-2 py-0.5 md:py-1 font-bold text-center text-[10px] md:text-base">
              COMMANDER
            </div>
            <div className="absolute inset-0 pointer-events-none border-[8px] md:border-[16px] border-black/20" />
            <div className="absolute top-1 right-1 md:top-2 md:right-2 text-green-400 text-[8px] md:text-xs font-bold">
                {frequency}
            </div>
          </div>
        </div>
      </div>

      {/* Text Box */}
      <div className="mt-6 md:mt-12 w-full max-w-4xl border-t border-blue-900 pt-4 md:pt-8">
        <div className="text-sm md:text-xl leading-relaxed min-h-[80px] md:min-h-[100px] text-blue-100 italic">
          {loading ? (
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 animate-ping" />
                <span>RECEIVING...</span>
            </div>
          ) : message}
        </div>
        <div className="mt-4 md:mt-8 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 md:px-8 py-1.5 md:py-2 border border-blue-400 hover:bg-blue-400 hover:text-black transition-colors uppercase tracking-widest text-[10px] md:text-sm font-bold"
          >
            Close (C)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Codec;
