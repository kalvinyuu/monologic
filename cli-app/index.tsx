import { useState, useEffect } from 'react';
import { render, Text, Box, useFocus, useInput } from 'ink'; // Import useFocus, useInput
import TextInput from 'ink-text-input';
import axios from 'axios';
import CodebaseScanner from './src/components/CodebaseScanner';
import { CodeAgent } from './src/agents/CodeAgent'; // Import CodeAgent

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
	const [isScannerActive, setIsScannerActive] = useState(true); // New state to track scanner activity
	const [activeInput, setActiveInput] = useState<'ollama' | 'codeAgent' | null>(null); // New state for active input

	useEffect(() => {
		if (!isScannerActive && activeInput === null) {
			setActiveInput('ollama'); // Set initial focus to Ollama chat once scanner is done
		}
	}, [isScannerActive, activeInput]);

	useInput((input, key) => {
		if (key.tab) {
			if (activeInput === 'ollama') {
				setActiveInput('codeAgent');
			} else if (activeInput === 'codeAgent') {
				setActiveInput('ollama');
			} else if (!isScannerActive) { // If no input is active and scanner is done, default to Ollama
				setActiveInput('ollama');
			}
		}
	});

	const [codeAgentInput, setCodeAgentInput] = useState('');
	const [codeAgentResponse, setCodeAgentResponse] = useState('Ask the Code Agent...');
	const [loadingCodeAgent, setLoadingCodeAgent] = useState(false);

	const codeAgent = new CodeAgent(); // Instantiate CodeAgent

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

	const handleCodeAgentSubmit = async (text: string) => {
		if (!text.trim()) return;

		setLoadingCodeAgent(true);
		setCodeAgentResponse('Code Agent is thinking...');

		try {
			const response = await codeAgent.invokeAgent(text, process.cwd());
			setCodeAgentResponse(response);
		} catch (error) {
			setCodeAgentResponse(`Error: ${getErrorMessage(error)}. Is Ollama running and model '${OLLAMA_MODEL}' available?`);
		} finally {
			setLoadingCodeAgent(false);
			setCodeAgentInput('');
		}
	};

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
				<CodebaseScanner
					onScanComplete={setLastScanResults}
					onScannerActivityChange={setIsScannerActive} // Pass the new prop
				/>
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

			{/* Code Agent Section */}
			<Box flexDirection="column" marginTop={2}>
				<Text bold underline>Code Agent ({OLLAMA_MODEL}):</Text>
				<Box>
					<Text>{codeAgentResponse}</Text>
				</Box>
				<Box marginTop={1}>
					<Text>Task: </Text>
					<TextInput
						value={codeAgentInput}
						onChange={setCodeAgentInput}
						onSubmit={handleCodeAgentSubmit}
						placeholder={loadingCodeAgent ? '' : 'Enter a task for the agent...'}
						focus={activeInput === 'codeAgent'} // Focus when activeInput is 'codeAgent'
					/>
				</Box>
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
						focus={activeInput === 'ollama'} // Focus when activeInput is 'ollama'
					/>
				</Box>
			</Box>
		</Box>
	);
}

render(<App />);
