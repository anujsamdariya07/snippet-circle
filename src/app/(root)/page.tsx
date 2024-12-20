import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs';
import React from 'react';
import Header from './_components/Header';
import EditorPanel from './_components/EditorPanel';
import OutputPanel from './_components/OutputPanel';

const Home = () => {
  return (
    <div className='min-h-screen'>
      <div className='max-w-[1800px] mx-atuo p-4'>
        <Header />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <EditorPanel />
          <OutputPanel />
        </div>
      </div>
    </div>
  );
};

export default Home;
