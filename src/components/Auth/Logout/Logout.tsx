// src/components/Logout.js
import React from 'react';
import { signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../../../firebase';
import { removeUser } from '../../../store/slices/userSlice';

const Logout = () => {
  const dispatch= useDispatch()
  const handleLogout = async () => {
    await signOut(auth);
    dispatch(removeUser())
  };

  return <button onClick={handleLogout}>Выйти</button>;
};

export default Logout;
