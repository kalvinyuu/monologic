import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StateGraph } from "@langchain/langgraph"; // Import StateGraph

// Define the state for our graph
interface AgentState {
  input: string;
  output: string;
  codebasePath: string;
}

export class CodeAgent {
  private ollamaModel: Ollama;
  private workflow: any; // LangGraph workflow

  constructor() { // Removed ollamaModelName parameter
    const ollamaModelName = process.env.OLLAMA_MODEL || "llama2"; // Read from .env or default to llama2
    this.ollamaModel = new Ollama({
      baseUrl: "http://localhost:11434",
      model: ollamaModelName,
    });

    // Define the graph
    const graph = new StateGraph<AgentState>({
      channels: {
        input: {
          reducer: (x: string, y: string) => y,
          defaultValue: "",
        },
        output: {
          reducer: (x: string, y: string) => y,
          defaultValue: "",
        },
        codebasePath: {
          reducer: (x: string, y: string) => y,
          defaultValue: "",
        },
      },
    })
      .addNode("llm_node", async (state: AgentState) => {
        const prompt = PromptTemplate.fromTemplate(
          `You are an expert code assistant. Your task is to analyze the codebase located at {codebasePath} and perform the following task: {input}.

          Provide a detailed response, including any code suggestions, explanations, or further questions you might have.
          `
        );
        const chain = prompt.pipe(this.ollamaModel);
        const result = await chain.invoke({
          codebasePath: state.codebasePath,
          input: state.input,
        });
        return { output: result };
      })
      .setEntryPoint("llm_node")
      .addConditionalEdges(
        "llm_node",
        // This is a simple conditional edge. In a real agent, you might have tools
        // and more complex logic to decide the next step.
        (state: AgentState) => "end" // Always end for now
      );

    this.workflow = graph.compile();
  }

  async invokeAgent(input: string, codebasePath: string): Promise<string> {
    const initialState: AgentState = {
      input,
      output: "",
      codebasePath,
    };
    const result = await this.workflow.invoke(initialState);
    return result.output;
  }
}
