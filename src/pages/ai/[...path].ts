import { agentResponse, getAgentDirectory, renderAgentDocument } from "../../lib/agent-content";

export async function getStaticPaths() {
  const { docs } = await getAgentDirectory();
  return docs.map(doc => ({ params: { path: doc.path.slice("/ai/".length) }, props: { doc } }));
}

export function GET({ props }: { props: any }) {
  return agentResponse(renderAgentDocument(props.doc));
}
