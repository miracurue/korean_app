/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dramas from './pages/Dramas';
import DramaDetails from './pages/DramaDetails';
import Music from './pages/Music';
import Dictionary from './pages/Dictionary';
import Quotes from './pages/Quotes';
import Upload from './pages/Upload';
import Player from './pages/Player';
import VideoPlayer from './pages/VideoPlayer';
import Poems from './pages/Poems';
import PoemReader from './pages/PoemReader';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dramas" element={<Dramas />} />
            <Route path="dramas/:id" element={<DramaDetails />} />
            <Route path="music" element={<Music />} />
            <Route path="dictionary" element={<Dictionary />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="upload" element={<Upload />} />
            <Route path="player/:id?" element={<Player />} />
            <Route path="player/video/:dramaId/:episodeId" element={<VideoPlayer />} />
            <Route path="poems" element={<Poems />} />
            <Route path="poem/:id?" element={<PoemReader />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
