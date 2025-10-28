import { useState, useEffect } from 'react';
import { render, Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import axios from 'axios';
import CodebaseScanner from './src/components/CodebaseScanner';

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2'; // Default to llama2 if not set

interface DesiredLoRA {
  id: string;
  name: string;
  description: string;
  baseModel: string;
  dataType: string;
  reward: number;
  status: string;
}

function App() {
	const [input, setInput] = useState('');
	const [ollamaResponse, setOllamaResponse] = useState('Type your message to Ollama...');
	const [loadingOllama, setLoadingOllama] = useState(false);
	const [desiredLoras, setDesiredLoras] = useState<DesiredLoRA[]>([]);
	const [loadingLoras, setLoadingLoras] = useState(true);
	const [lorasError, setLorasError] = useState<string | null>(null);
	const [lastScanResults, setLastScanResults] = useState<any>(null);

	// Helper to get error message
	const getErrorMessage = (error: unknown): string => {
		if (error instanceof Error) {
			return error.message;
		}
		return String(error);
	};

	// Fetch desired LoRAs from the web app
	useEffect(() => {
		const fetchLoras = async () => {
			try {
				const response = await axios.get<DesiredLoRA[]>('http://localhost:3000/api/loras/desired');
				setDesiredLoras(response.data);
			} catch (error) {
				setLorasError(`Failed to fetch desired LoRAs: ${getErrorMessage(error)}. Is the web app running?`);
			} finally {
				setLoadingLoras(false);
			}
		};

		fetchLoras();
	}, []);

	const handleOllamaSubmit = async (text: string) => {
		if (!text.trim()) return;

		setLoadingOllama(true);
		setOllamaResponse('Thinking...');

		try {
			const response = await axios.post('http://localhost:11434/api/generate', {
				model: OLLAMA_MODEL,
				prompt: text,
				stream: false,
			});
			setOllamaResponse(response.data.response);
		} catch (error) {
			setOllamaResponse(`Error: ${getErrorMessage(error)}. Is Ollama running and model '${OLLAMA_MODEL}' available?`);
		} finally {
			setLoadingOllama(false);
			setInput('');
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			<Box>
				<Text bold color="green">Monologic CLI</Text>
			</Box>

			{/* Codebase Scanner Section */}
			<Box marginTop={1}>
				<CodebaseScanner onScanComplete={setLastScanResults} />
			</Box>

			{/* Desired LoRAs Section */}
			<Box flexDirection="column" marginTop={1}>
				<Text bold underline>Desired LoRAs:</Text>
				{loadingLoras && <Text>Loading desired LoRAs...</Text>}
				{lorasError && <Text color="red">{lorasError}</Text>}
				{!loadingLoras && desiredLoras.length === 0 && !lorasError && (
					<Text>No desired LoRAs found.</Text>
				)}
				{!loadingLoras && desiredLoras.length > 0 && (
					<Box flexDirection="column">
						{desiredLoras.map((lora) => (
							<Box key={lora.id} flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1} paddingY={0}>
								<Text bold>{lora.name} (Reward: {lora.reward} MONO)</Text>
								<Text>{lora.description}</Text>
								<Text dimColor>Base Model: {lora.baseModel} | Data Type: {lora.dataType}</Text>
							</Box>
						))}
					</Box>
				)}
			</Box>

			{/* Ollama Chat Section */}
			<Box flexDirection="column" marginTop={2}>
				<Text bold underline>Ollama Chat ({OLLAMA_MODEL}):</Text>
				<Box>
					<Text>{ollamaResponse}</Text>
				</Box>
				<Box marginTop={1}>
					<Text>You: </Text>
					<TextInput
						value={input}
						onChange={setInput}
						onSubmit={handleOllamaSubmit}
						placeholder={loadingOllama ? '' : 'Ask something...'}
					/>
				</Box>
			</Box>
		</Box>
	);
}

render(<App />);
