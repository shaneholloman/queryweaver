    
export function showGraph(data) {

    const Graph = ForceGraph()(document.getElementById('schema-graph'))
        .graphData(data)
        // Custom node renderer: draw table-like boxes with columns
        .nodeCanvasObject((node, ctx, globalScale) => {
            const nodeWidth = 160;
            const lineHeight = 14;
            const padding = 8;
            const headerHeight = 20;
            const fontSize = 12;
            const textColor = '#111';
            const fillColor = '#f6f6f6';
            const strokeColor = '#222';

            // compute box height from number of columns
            const boxHeight = headerHeight + node.columns.length * lineHeight + padding * 2;

            // Draw the box
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.fillRect(node.x - nodeWidth / 2, node.y - boxHeight / 2, nodeWidth, boxHeight);
            ctx.strokeRect(node.x - nodeWidth / 2, node.y - boxHeight / 2, nodeWidth, boxHeight);

            // Table name (centered in header area)
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.name, node.x, node.y - boxHeight / 2 + headerHeight / 2 + padding / 2);

            // Columns list (left aligned)
            ctx.font = `${fontSize - 2}px Arial`;
            ctx.textAlign = 'left';
            const startX = node.x - nodeWidth / 2 + padding;
            let colY = node.y - boxHeight / 2 + headerHeight + padding;
            node.columns.forEach((col) => {
                ctx.fillText(col, startX, colY);
                colY += lineHeight;
            });
        })
        // Draw links as lines behind nodes
        .linkCanvasObject((link, ctx) => {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(link.source.x, link.source.y);
            ctx.lineTo(link.target.x, link.target.y);
            ctx.stroke();
        })
        // Note: avoid chaining .d3Force(...) getters because they return the force object
        // instead, set forces below using .d3Force(name, force) when d3 is available.
        ;

    // Configure forces using d3 if available, otherwise leave defaults
    if (typeof d3 !== 'undefined' && typeof d3.forceManyBody === 'function') {
        Graph.d3Force('charge', d3.forceManyBody().strength(-900));
        Graph.d3Force('link', d3.forceLink().id(d => d.id).distance(220).strength(0.9));

        // Add collision force to avoid overlap when available
        if (typeof d3.forceCollide === 'function') {
            Graph.d3Force('collision', d3.forceCollide().radius(() => 90).strength(0.9));
        }
    } else {
        // Fallback: if d3 not available, slightly adjust directional link arrows only.
        // ForceGraph will use its default forces in this case.
    }

    // Stop when layout stabilizes and set canvas size
    Graph.onEngineStop(() => {
        console.log('Engine stopped, layout stabilized.');
    }).width(window.innerWidth).height(window.innerHeight);

    // Optional: add directional arrows on links to make edges clearer
    Graph.linkDirectionalArrowLength(6).linkDirectionalArrowRelPos(1);
    }