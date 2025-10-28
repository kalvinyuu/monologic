
'use client';

import { useState, useEffect } from 'react';

export default function TrainingSimulation() {
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState({ loss: 0, accuracy: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress > 0) {
      setMetrics({
        loss: Math.random() * 0.1,
        accuracy: Math.random() * 0.9,
      });
    }
  }, [progress]);

  return (
    <div className="w-full max-w-lg p-4 border border-gray-200 rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">LoRA Training Simulation</h3>
      <progress value={progress} max="100" className="w-full" />
      <div className="mt-2 text-sm text-gray-600">
        <p>Progress: {progress}%</p>
        <p>Loss: {metrics.loss.toFixed(4)}</p>
        <p>Accuracy: {metrics.accuracy.toFixed(4)}</p>
      </div>
    </div>
  );
}
