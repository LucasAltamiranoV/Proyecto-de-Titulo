import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPageWrapper from  '../pages/All/LoginPageWrapper'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPageWrapper />} />
    </Routes>
  );
}

export default AppRoutes;

