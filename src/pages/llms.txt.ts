import { agentResponse, getAgentDirectory } from "../lib/agent-content";

export async function GET() {
  const { index } = await getAgentDirectory();
  return agentResponse(index, "text/plain");
}
