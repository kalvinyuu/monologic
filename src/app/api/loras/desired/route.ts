import { NextResponse } from 'next/server';

export async function GET() {
  const desiredLoras = [
    {
      id: 'lora-react-debug-v1',
      name: 'React useEffect Debugging',
      description: 'Fine-tune LLM to provide better solutions for React useEffect issues.',
      baseModel: 'deepseek-coder:1.3b',
      dataType: 'react_code_snippets',
      reward: 600,
      status: 'open',
    },
    {
      id: 'lora-finance-books-v1',
      name: 'Financial Books & Strategies',
      description: 'Fine-tune LLM on financial books and strategies to improve financial advice.',
      baseModel: 'llama2',
      dataType: 'financial_texts',
      reward: 800,
      status: 'open',
    },
    {
      id: 'lora-timeseries-v1',
      name: 'Time Series Analysis Strategies',
      description: 'Provide LLM with more time series analysis strategies for improved forecasting.',
      baseModel: 'llama2',
      dataType: 'time_series_data',
      reward: 700,
      status: 'open',
    },
  ];

  return NextResponse.json(desiredLoras);
}
