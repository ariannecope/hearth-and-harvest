import { BrowserRouter, Routes, Route } from 'react-router';
import { FarmProvider } from './context/FarmContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import MyFarm from './pages/MyFarm.jsx';
import FarmProfile from './pages/FarmProfile.jsx';
import OpenFarm from './pages/OpenFarm.jsx';
import Credits from './pages/Credits.jsx';
import Grow from './pages/Grow.jsx';
import PlantDetail from './pages/PlantDetail.jsx';
import Raise from './pages/Raise.jsx';
import BreedDetail from './pages/BreedDetail.jsx';
import Compare from './pages/Compare.jsx';
import Plans from './pages/Plans.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <FarmProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="my-farm" element={<MyFarm />} />
            <Route path="farm" element={<FarmProfile />} />
            <Route path="open" element={<OpenFarm />} />
            <Route path="credits" element={<Credits />} />
            <Route path="grow" element={<Grow />} />
            <Route path="grow/:id" element={<PlantDetail />} />
            <Route path="raise" element={<Raise />} />
            <Route path="raise/compare" element={<Compare />} />
            <Route path="raise/:id" element={<BreedDetail />} />
            <Route path="plans" element={<Plans />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </FarmProvider>
    </BrowserRouter>
  );
}
