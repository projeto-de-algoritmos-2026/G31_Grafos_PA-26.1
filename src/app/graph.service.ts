import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  constructor() { }

  /**
   * Verifica se o grafo é conexo usando Busca em Largura (BFS)
   * @param nodes Lista com todos os identificadores (ex: IDs, nomes) dos nós do grafo
   * @param adjacencyList Lista de adjacência representando as arestas (Map<No, Vizinhos[]>)
   * @returns boolean
   */
  isGraphConnected(nodes: string[], adjacencyList: Map<string, string[]>): boolean {
    if (nodes.length <= 1) {
      return true;
    }

    const visited = new Set<string>();
    const queue: string[] = [];

    const startNode = nodes[0];
    queue.push(startNode);
    visited.add(startNode);

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      const neighbors = adjacencyList.get(currentNode) || [];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return visited.size === nodes.length;
  }

  /**
   * Verifica se existe um caminho entre dois nós específicos
   * @param startNode Nó de origem
   * @param endNode Nó de destino
   * @param adjacencyList Lista de adjacência
   * @returns string[] | null Retorna o caminho encontrado ou null
   */
  hasPath(startNode: string, endNode: string, adjacencyList: Map<string, string[]>): string[] | null {
    if (startNode === endNode) return [startNode];
    if (!adjacencyList.has(startNode) || !adjacencyList.has(endNode)) return null;

    const visited = new Set<string>();
    const queue: string[] = [startNode];
    visited.add(startNode);

    const parents = new Map<string, string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === endNode) {
        const path: string[] = [];
        let curr: string | undefined = endNode;
        while (curr) {
          path.unshift(curr);
          curr = parents.get(curr);
        }
        return path;
      }

      const neighbors = adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parents.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }
    return null;
  }
}