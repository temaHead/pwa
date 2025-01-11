import './App.css';
import { Routes, Route } from 'react-router-dom';
import SignIn from './components/Auth/SignIn/SignIn';
import SignUp from './components/Auth/SignUp/SignUp';
import './firebase';
import Home from './components/Home/Home';
import Start from './components/Start/Start';
import Room from './components/Home/components/Room/Room';
import Measurements from './components/Home/components/Measurements/Measurements';
import Profile from './components/Home/components/Profile/Profile';
import Desktop from './components/Home/components/Desktop/Desktop';

function App() {
    return (
      <Routes>
      <Route path='/' element={<Home />}>
          <Route path='' element={<Desktop />}> {/* Весь контент будет отображаться внутри Desktop */}
              <Route path='/room' element={<Room />} />
              <Route path='/measurements' element={<Measurements />} />
              <Route path='/profile' element={<Profile />} />
          </Route>
      </Route>
      <Route path='/start' element={<Start />} />
      <Route path='/signIn' element={<SignIn />} />
      <Route path='/signUp' element={<SignUp />} />
  </Routes>
    );
}

export default App;
