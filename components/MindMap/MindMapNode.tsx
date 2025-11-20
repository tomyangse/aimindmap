import React from 'react';
import * as d3 from 'd3';
import { MindMapData } from '../../types';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants';

interface MindMapNodeProps {
  node: d3.HierarchyNode<MindMapData>;
  onClick: (e: React.MouseEvent, node: MindMapData) => void;
  isSelected: boolean;
  onToggleCollapse: (e: React.MouseEvent, node: MindMapData) => void;
}

export const MindMapNode: React.FC<MindMapNodeProps> = ({ node, onClick, isSelected, onToggleCollapse }) => {
  // In horizontal tree, x is vertical position, y is horizontal position
  const { x, y, data } = node as any; 
  
  const hasChildren = data.children && data.children.length > 0;

  return (
    <g 
      transform={`translate(${y},${x})`}
      className={`cursor-pointer transition-all duration-300 ease-in-out hover:opacity-90 group`}
      onClick={(e) => onClick(e, data)}
    >
      {/* Shadow for depth */}
      <rect
        x={0}
        y={-NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        fill="#000"
        opacity={0.1}
        transform="translate(3, 3)"
      />

      {/* Main Node Body */}
      <rect
        x={0}
        y={-NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        fill={data.color || '#ffffff'}
        stroke={isSelected ? '#2563EB' : '#E2E8F0'}
        strokeWidth={isSelected ? 3 : 1}
        className="transition-colors"
      />

      {/* Text Label */}
      <foreignObject x={10} y={-NODE_HEIGHT / 2} width={NODE_WIDTH - 20} height={NODE_HEIGHT}>
         <div className="flex items-center justify-center w-full h-full">
            <p className={`text-sm font-medium text-center truncate px-1 ${data.color ? 'text-white' : 'text-gray-700'}`} title={data.label}>
                {data.label}
            </p>
         </div>
      </foreignObject>

      {/* Collapse/Expand Circle Indicator */}
      {hasChildren && (
        <g 
            transform={`translate(${NODE_WIDTH}, 0)`} 
            onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(e, data);
            }}
            className="cursor-pointer hover:scale-110 transition-transform"
        >
            <circle r={8} fill="#fff" stroke="#94A3B8" strokeWidth={1} />
            <text 
                x={0} 
                y={2.5} 
                textAnchor="middle" 
                fontSize="10px" 
                fill="#64748B"
                style={{ pointerEvents: 'none' }}
            >
                {data.isCollapsed ? '+' : '-'}
            </text>
        </g>
      )}
    </g>
  );
};