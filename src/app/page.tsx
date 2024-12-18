import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs';
import React from 'react';

const Home = () => {
  return (
    <div>
      <SignedOut>
        <SignInButton />
      </SignedOut>

      <UserButton/>

      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </div>
  );
};

export default Home;
