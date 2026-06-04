import '@testing-library/jest-dom';

// Reset localStorage between every test so tests never bleed into each other
beforeEach(() => {
  window.localStorage.clear();
});
