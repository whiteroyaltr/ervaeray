// ============================================================
// MÜZİK ÇALAR CONFIG
// R2 URL'lerini gerçek ses ve kapak fotoğrafı URL'leriyle değiştirin.
// ============================================================

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string; // R2 genel URL'si (kapak fotoğrafı)
  audioUrl: string; // R2 genel URL'si (ses dosyası)
  memoryNote: string; // bu şarkı bize neyi hatırlatıyor
}

export interface MusicConfig {
  pageTitle: string;
  songs: Song[];
}

export const musicConfig: MusicConfig = {
  pageTitle: "Bizim Şarkılarımız 🎵",

  songs: [
    // TODO: gerçek şarkı bilgileri, R2 URL'leri ve anı notlarıyla doldurun
    {
      id: "song-1",
      title: "Şarkı Adı 1",
      artist: "Sanatçı Adı",
      coverUrl: "https://<r2-domain>/music/covers/song-1.jpg", // TODO: R2 URL
      audioUrl: "https://<r2-domain>/music/song-1.mp3",       // TODO: R2 URL
      memoryNote: "Bu şarkı bize... hatırlatıyor. 🎶",         // TODO: anı notu
    },
    {
      id: "song-2",
      title: "Şarkı Adı 2",
      artist: "Sanatçı Adı",
      coverUrl: "https://<r2-domain>/music/covers/song-2.jpg",
      audioUrl: "https://<r2-domain>/music/song-2.mp3",
      memoryNote: "Bu şarkıyı ilk duyduğumuzda...",
    },
    {
      id: "song-3",
      title: "Şarkı Adı 3",
      artist: "Sanatçı Adı",
      coverUrl: "https://<r2-domain>/music/covers/song-3.jpg",
      audioUrl: "https://<r2-domain>/music/song-3.mp3",
      memoryNote: "Bu şarkı her zaman beni sana götürüyor...",
    },
  ],
};
