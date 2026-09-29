import networkx as nx

def create_execution_dag(work_packets):
    """Build a directed acyclic graph from work packet dependencies."""
    G = nx.DiGraph()
    
    for packet in work_packets:
        G.add_node(packet.packet_id, packet=packet)
        for dep in packet.dependencies:
            G.add_edge(dep, packet.packet_id)
    
    # Check for cycles (violates DAG constraint)
    try:
        cycles = list(nx.find_cycle(G, orientation="original"))
        if cycles:
            raise ValueError(f"Circular dependency detected: {cycles}")
    except nx.NetworkXNoCycle:
        pass  # Expected: no cycles
    
    # Topological sort using Kahn's algorithm
    sorted_nodes = list(nx.topological_sort(G))
    
    # Group by parallel execution waves
    execution_waves = []
    visited = set()
    
    for node in sorted_nodes:
        if node in visited:
            continue
            
        wave = []
        # Nodes without incoming dependencies in remaining graph can run parallel
        remaining_nodes = [n for n in sorted_nodes if n not in visited]
        remaining_graph = G.subgraph(remaining_nodes)
        
        for candidate in remaining_nodes:
            if remaining_graph.in_degree(candidate) == 0:
                wave.append(G.nodes[candidate]["packet"])
                visited.add(candidate)
        
        if wave:
            execution_waves.append(wave)
    
    return execution_waves

def validate_and_dispatch_blueprint(blueprint_path):
    """Enhanced validation with DAG resolution."""
    validation_result = parse_and_validate_blueprint(blueprint_path)
    
    if not validation_result.is_valid:
        return validation_result
    
    # Create execution DAG
    execution_waves = create_execution_dag(validation_result.packets)
    
    print(f"\\n[EXECUTION WAVES]: {len(execution_waves)}")
    for wave_idx, wave in enumerate(execution_waves):
        print(f"  Wave {wave_idx + 1} (parallel: {len(wave)} packets):")
        for packet in wave:
            print(f"    ⚡ [{packet.packet_id}] -> {packet.target_file}")
    
    # Update validation result with waves
    validation_result.execution_waves = execution_waves
    return validation_result
