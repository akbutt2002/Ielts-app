import { useEffect, useState } from 'react';

export function useTestTimer(isStarted: boolean, isSubmitted: boolean) {
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    if (!isStarted || isSubmitted) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isStarted, isSubmitted]);

  return { timeLeft, setTimeLeft };
}
