
import React, { useRef, useState, useEffect } from 'react';

interface CameraScannerProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      setError("تعذر الوصول إلى الكاميرا. يرجى التحقق من الأذونات.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-10 left-10 right-10 flex justify-between items-start">
          <div className="text-white">
            <p className="text-[10px] font-black tracking-widest uppercase text-blue-400">Scan Mode: AI_DOCUMENT_DETECTION</p>
            <h2 className="text-2xl font-black">الماسح الضوئي السيادي</h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-2 animate-pulse"></span>
            <span className="text-[10px] font-bold text-white uppercase">Live Feed: 1080p</span>
          </div>
        </div>

        {/* Framing Guides */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative w-full max-w-lg aspect-[3/4] border-2 border-white/10 rounded-3xl">
            {/* Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
            
            {/* Scanning Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_3s_linear_infinite]"></div>
          </div>
        </div>
      </div>

      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover opacity-60 grayscale-[0.3]"
      />

      <div className="absolute bottom-12 flex items-center gap-12 z-20">
        <button 
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
        >
          ✕
        </button>

        <button 
          onClick={handleCapture}
          disabled={isCapturing}
          className="w-24 h-24 rounded-full bg-white border-8 border-blue-600/30 flex items-center justify-center active:scale-90 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)]"
        >
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl">📸</div>
        </button>

        <button 
          onClick={startCamera}
          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
        >
          🔄
        </button>
      </div>

      {error && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-10 text-center z-[1001]">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-2xl font-black text-white mb-2">خطأ في الأجهزة</h3>
          <p className="text-slate-400 max-w-sm mb-8">{error}</p>
          <button onClick={onClose} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest">العودة للوحة التحكم</button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CameraScanner;
