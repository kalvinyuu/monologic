
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const chat = async (message: string) => {
  const response = await hf.chatCompletion({
    model: 'HuggingFaceH4/tiny-random-Llama-3',
    messages: [{ role: 'user', content: message }],
  });

  return response.choices[0].message.content;
};
