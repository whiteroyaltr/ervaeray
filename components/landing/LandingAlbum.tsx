"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  key: string;
  url: string;
}

export default function LandingAlbum() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Drag to scroll state
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false); // To prevent click if dragged

  // Lightbox state
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/photos?prefix=photos/landing/")
      .then((res) => res.json())
      .then((data) => {
        if (data.photos) setPhotos(data.photos);
      })
      .catch((err) => console.error("Fotoğraflar yüklenemedi", err))
      .finally(() => setLoading(false));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setDragged(false); // Reset drag
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // kaydırma hızı
    scrollRef.current.scrollLeft = scrollLeft - walk;
    
    // Eğer 5 pikselden fazla sürüklendiyse, bunun bir click olmadığını belirt
    if (Math.abs(walk) > 5) {
      setDragged(true);
    }
  };

  if (loading) return null;
  if (photos.length === 0) return null;

  return (
    <>
      <motion.div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          width: "100%",
          maxWidth: 720,
          marginBottom: 48,
          display: "flex",
          gap: 16,
          padding: "20px 10px",
          overflowX: "auto",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE
          WebkitOverflowScrolling: "touch",
          cursor: isDown ? "grabbing" : "grab",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          ::-webkit-scrollbar { display: none; }
        `}} />
        
        {photos.map((photo, i) => {
          const rotate = i % 2 === 0 ? 3 : -3;
          const mt = i % 2 === 0 ? 0 : 24;

          return (
            <motion.div
              key={photo.key}
              onClick={() => {
                if (!dragged) setSelectedPhoto(photo.url);
              }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              style={{
                flexShrink: 0,
                width: 160,
                height: 200,
                borderRadius: 12,
                marginTop: mt,
                background: "white",
                padding: 6,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transformOrigin: "center",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
              }}
              initial={{ rotate }}
              animate={{ rotate }}
            >
              <div style={{ flex: 1, borderRadius: 8, overflow: "hidden", background: "#f0f0f0" }}>
                <img
                  src={photo.url}
                  alt="Anı"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none", // Sürüklerken fotoğraf seçilmesini engeller
                  }}
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <div style={{ height: 20 }} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tam Ekran Fotoğraf Görüntüleyici (Lightbox) */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(5px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              cursor: "zoom-out",
            }}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedPhoto}
              alt="Büyük Anı"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: 16,
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                cursor: "default",
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "white",
                width: 44,
                height: 44,
                borderRadius: "50%",
                fontSize: "2rem",
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
