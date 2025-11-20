import React from 'react';
import * as d3 from 'd3';
import { NODE_WIDTH } from '../../constants';

interface MindMapLinkProps {
  link: d3.HierarchyLink<any>;
}

export const MindMapLink: React.FC<MindMapLinkProps> = ({ link }) => {
  const { source, target } = link;

  // Bezier curve calculation for horizontal layout
  // Source is (y, x) because we flipped axes for horizontal layout
  const sourceX = source.y + NODE_WIDTH;
  const sourceY = source.x;
  const targetX = target.y;
  const targetY = target.x;

  const path = d3.linkHorizontal()
    .x((d: any) => d[0])
    .y((d: any) => d[1])
    ({ source: [sourceX, sourceY], target: [targetX, targetY] });

  return (
    <path
      d={path || ''}
      fill="none"
      stroke="#CBD5E1"
      strokeWidth="2"
      className="transition-all duration-500"
    />
  );
};
