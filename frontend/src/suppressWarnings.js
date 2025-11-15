// Suppress findDOMNode deprecation warnings from react-quill and tracking prevention warnings
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('findDOMNode') ||
     args[0].includes('ReactDOM.findDOMNode') ||
     args[0].includes('Tracking Prevention blocked access to storage'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('findDOMNode') ||
     args[0].includes('ReactDOM.findDOMNode') ||
     args[0].includes('Tracking Prevention blocked access to storage'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

