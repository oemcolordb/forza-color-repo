import { useChat } from '@ai-sdk/react';

const { sendMessage } = useChat({});

// Hovering over sendMessage or passing something wrong will cause type errors.
// I will just use typescript compiler API or type-check to see the error.
sendMessage({ wrongProperty: true });
