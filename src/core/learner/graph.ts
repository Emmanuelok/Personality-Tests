import { toEvidenceReference } from "../evidence";
import type {
  LearnerGraph,
  LearnerGraphEdge,
  LearnerGraphNode,
  LearnerInput,
  LearnerState,
} from "./types";

const unique = <T>(items: T[]): T[] => Array.from(new Set(items));

const addNode = (nodes: LearnerGraphNode[], node: LearnerGraphNode): void => {
  if (!nodes.some((existing) => existing.id === node.id)) nodes.push(node);
};

const addEdge = (edges: LearnerGraphEdge[], edge: LearnerGraphEdge): void => {
  if (!edges.some((existing) =>
    existing.from === edge.from &&
    existing.to === edge.to &&
    existing.relation === edge.relation
  )) edges.push(edge);
};

/** Build a stable, inspectable graph from bounded agent outputs. */
export function buildLearnerGraph(input: LearnerInput, state: LearnerState): LearnerGraph {
  const nodes: LearnerGraphNode[] = [];
  const edges: LearnerGraphEdge[] = [];

  for (const evidence of state.reviewableEvidence) {
    const reference = toEvidenceReference(evidence);
    if (!reference) continue;
    addNode(nodes, {
      id: `evidence:${reference.id}`,
      kind: "evidence",
      label: reference.summary,
      createdBy: "evidence-curation",
      evidenceIds: [reference.id],
    });
  }

  for (const observation of state.observations) {
    addNode(nodes, {
      id: observation.id,
      kind: "observation",
      label: observation.statement,
      createdBy: "interpretation",
      evidenceIds: observation.evidenceIds,
    });
    for (const evidenceId of observation.evidenceIds) {
      addEdge(edges, { from: `evidence:${evidenceId}`, to: observation.id, relation: "supports" });
    }
  }

  const goals = [...(input.goals ?? [])]
    .filter((goal) => goal.status !== "completed")
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id));
  for (const goal of goals) {
    addNode(nodes, {
      id: `goal:${goal.id}`,
      kind: "goal",
      label: goal.title,
      createdBy: "goal-mapping",
      evidenceIds: state.goalMappings.find((mapping) => mapping.goalId === goal.id)?.evidenceIds ?? [],
    });
  }

  for (const mapping of state.goalMappings) {
    for (const evidenceId of mapping.evidenceIds) {
      addEdge(edges, { from: `evidence:${evidenceId}`, to: `goal:${mapping.goalId}`, relation: "informs" });
    }
  }

  if (state.mission) {
    addNode(nodes, {
      id: state.mission.id,
      kind: "mission",
      label: state.mission.title,
      createdBy: "mission",
      evidenceIds: state.mission.evidenceIds,
    });
    addEdge(edges, { from: `goal:${state.mission.goalId}`, to: state.mission.id, relation: "serves" });
  }

  for (const practice of state.practices) {
    addNode(nodes, {
      id: practice.id,
      kind: "practice",
      label: practice.title,
      createdBy: "practice-routing",
      evidenceIds: practice.evidenceIds,
    });
    if (state.mission) addEdge(edges, { from: state.mission.id, to: practice.id, relation: "serves" });
    for (const evidenceId of practice.evidenceIds) {
      addEdge(edges, { from: `evidence:${evidenceId}`, to: practice.id, relation: "informs" });
    }
  }

  if (state.progress) {
    addNode(nodes, {
      id: "progress:current",
      kind: "progress",
      label: state.progress.statement,
      createdBy: "progress-review",
      evidenceIds: state.progress.evidenceIds,
    });
    for (const practice of state.practices) {
      addEdge(edges, { from: practice.id, to: "progress:current", relation: "reviews" });
    }
  }

  for (const reflection of state.reflections) {
    addNode(nodes, {
      id: reflection.id,
      kind: "reflection",
      label: reflection.prompt,
      createdBy: "reflection",
      evidenceIds: reflection.evidenceIds,
    });
    const source = state.progress ? "progress:current" : state.mission?.id;
    if (source) addEdge(edges, { from: source, to: reflection.id, relation: "prompts" });
  }

  return {
    nodes: nodes
      .map((node) => ({ ...node, evidenceIds: unique(node.evidenceIds) }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    edges: edges.sort((a, b) =>
      a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.relation.localeCompare(b.relation)
    ),
  };
}

export function learnerGraphNode(graph: LearnerGraph, id: string): LearnerGraphNode | undefined {
  return graph.nodes.find((node) => node.id === id);
}

export function learnerGraphNeighbors(graph: LearnerGraph, id: string): LearnerGraphNode[] {
  const ids = graph.edges.filter((edge) => edge.from === id).map((edge) => edge.to);
  return graph.nodes.filter((node) => ids.includes(node.id));
}
