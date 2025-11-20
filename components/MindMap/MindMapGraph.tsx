import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MindMapData, Dimensions } from '../../types';
import { MindMapNode } from './MindMapNode';
import { MindMapLink } from './MindMapLink';
import { NODE_HEIGHT, NODE_WIDTH, HORIZONTAL_SPACING, VERTICAL_SPACING } from '../../constants';

interface MindMapGraphProps {
  data: MindMapData;
  selectedNodeId: string | null;
  onNodeClick: (node: MindMapData) => void;
  onToggleCollapse: (node: MindMapData) => void;
}

export const MindMapGraph: React.FC<MindMapGraphProps> = ({ 
    data, 
    selectedNodeId, 
    onNodeClick,
    onToggleCollapse 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 1000, height: 600 });
  
  // Manage D3 zoom transform state locally to synchronize React rendering
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity.translate(100, 300).scale(0.8));

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Initialize D3 Zoom
  useEffect(() => {
    if (!svgRef.current) return;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    const svg = d3.select(svgRef.current);
    svg.call(zoom);
    
    // Initial centering could go here if needed, but initial state handles it well enough
  }, []);

  // Compute Layout
  const { nodes, links } = useMemo(() => {
    // Create hierarchy
    const root = d3.hierarchy<MindMapData>(data);
    
    // Calculate Tree Layout
    // Note: We use nodeSize for a fixed layout that grows, rather than .size() which fits into a box
    const treeLayout = d3.tree<MindMapData>()
      .nodeSize([VERTICAL_SPACING, HORIZONTAL_SPACING])
      .separation((a, b) => (a.parent === b.parent ? 1.1 : 1.3));

    treeLayout(root);

    // Filter out hidden nodes (children of collapsed parents)
    // We need to traverse and manually hide, but d3 hierarchy preserves logic if we filter properly
    // A simpler way for this demo is to mutate the 'children' property in the *data* passed to hierarchy
    // However, since we want to animate, we'll just filter the flat list for rendering
    
    const visibleNodes: d3.HierarchyNode<MindMapData>[] = [];
    const visibleLinks: d3.HierarchyLink<MindMapData>[] = [];

    // Helper to check if all ancestors are expanded
    const isVisible = (n: d3.HierarchyNode<MindMapData>) => {
        let current = n;
        while(current.parent) {
            if (current.parent.data.isCollapsed) return false;
            current = current.parent;
        }
        return true;
    };

    root.descendants().forEach(node => {
        if (isVisible(node)) {
            visibleNodes.push(node);
        }
    });

    root.links().forEach(link => {
        if (isVisible(link.target)) {
            visibleLinks.push(link);
        }
    });

    return { nodes: visibleNodes, links: visibleLinks };

  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 overflow-hidden relative cursor-move select-none">
        {/* Grid Pattern Background */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
                backgroundImage: 'radial-gradient(#64748B 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}
        ></div>

      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
      >
        <g transform={transform.toString()}>
          <g>
            {links.map(link => (
              <MindMapLink 
                key={`${link.source.data.id}-${link.target.data.id}`} 
                link={link} 
              />
            ))}
          </g>
          <g>
            {nodes.map(node => (
              <MindMapNode
                key={node.data.id}
                node={node}
                isSelected={selectedNodeId === node.data.id}
                onClick={(e, n) => {
                    e.stopPropagation();
                    onNodeClick(n);
                }}
                onToggleCollapse={(e, n) => {
                    e.stopPropagation();
                    onToggleCollapse(n);
                }}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};
