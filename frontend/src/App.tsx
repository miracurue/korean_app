/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout';
import Home from './pages/Home';
import Clips from './pages/Clips';
import ClipDetails from './pages/ClipDetails';
import LocalMediaPlayer from './pages/LocalMediaPlayer';
import Dictionary from './pages/Dictionary';
import Quotes from './pages/Quotes';
import Poems from './pages/Poems';
import PoemReader from './pages/PoemReader';
import QuoteReader from './pages/QuoteReader';
import Profile from './pages/Profile';
import Music from './pages/Music';
import Player from './pages/Player';
import VideoPlayer from './pages/VideoPlayer';
import DramaDetails from './pages/DramaDetails';
import Dramas from './pages/Dramas';

import AdminUpload from './pages/AdminUpload';
import SubtitleEditor from './pages/SubtitleEditor';
import VideoRoom from './pages/rooms/VideoRoom';
import AudioRoom from './pages/rooms/AudioRoom';
import ReaderRoom from './pages/rooms/ReaderRoom';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dramas" element={<Dramas />} />
            <Route path="clips" element={<Clips />} />
            <Route path="clip/:id" element={<ClipDetails />} />
            <Route path="dictionary" element={<Dictionary />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="upload" element={<AdminUpload />} />
            <Route path="subtitle-editor" element={<SubtitleEditor />} />
            {/* Both local-player routes use the same component — differentiated by router state mediaType */}
            <Route path="local-player" element={<LocalMediaPlayer />} />
            <Route path="local-audio-player" element={<LocalMediaPlayer />} />
            <Route path="poems" element={<Poems />} />
            <Route path="poem/:id?" element={<PoemReader />} />
            <Route path="quote/:id?" element={<QuoteReader />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="music" element={<Music />} />
            <Route path="player/:id" element={<Player />} />
            <Route path="player/video/:videoId" element={<VideoPlayer />} />
            <Route path="dramas/:id" element={<DramaDetails />} />

            {/* Study Rooms */}
            <Route path="rooms/video" element={<VideoRoom />} />
            <Route path="rooms/audio" element={<AudioRoom />} />
            <Route path="rooms/reader" element={<ReaderRoom />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
