import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Download, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Teams User Sends Message\n📱 Teams Client' },
    position: { x: 100, y: 0 },
    style: { background: '#e1f5fe', border: '2px solid #0277bd', color: '#01579b' }
  },
  {
    id: '2',
    data: { label: 'Teams Bot Receives Message\n📄 api/messages/index.js' },
    position: { x: 100, y: 100 },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', color: '#1b5e20' }
  },
  {
    id: '3',
    data: { label: 'Message Type Check\n📄 api/messages/index.js' },
    position: { x: 100, y: 200 },
    style: { background: '#fff3e0', border: '2px solid #f57c00', color: '#e65100' }
  },
  {
    id: '4a',
    data: { label: 'Bot Response\n(hi/hello/help)\n📄 api/messages/index.js' },
    position: { x: -100, y: 300 },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2', color: '#4a148c' }
  },
  {
    id: '4b',
    data: { label: 'Normal Processing\n(other messages)\n📄 api/messages/index.js' },
    position: { x: 300, y: 300 },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2', color: '#4a148c' }
  },
  {
    id: '5',
    type: 'input',
    data: { label: 'User Opens /create-case\n🌐 Browser' },
    position: { x: 600, y: 0 },
    style: { background: '#e1f5fe', border: '2px solid #0277bd', color: '#01579b' }
  },
  {
    id: '6',
    data: { label: 'Teams SDK Initialize\n📄 src/pages/CreateCase.tsx' },
    position: { x: 600, y: 100 },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', color: '#1b5e20' }
  },
  {
    id: '7',
    data: { label: 'Extract Message Data\nfrom URL params\n📄 src/pages/CreateCase.tsx' },
    position: { x: 600, y: 200 },
    style: { background: '#fff3e0', border: '2px solid #f57c00', color: '#e65100' }
  },
  {
    id: '8',
    data: { label: 'Auto-populate Form\n📄 src/pages/CreateCase.tsx' },
    position: { x: 600, y: 300 },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2', color: '#4a148c' }
  },
  {
    id: '9',
    data: { label: 'User Fills Ticket Details\n📄 src/pages/CreateCase.tsx' },
    position: { x: 600, y: 400 },
    style: { background: '#e1f5fe', border: '2px solid #0277bd', color: '#01579b' }
  },
  {
    id: '10',
    data: { label: 'POST to /api/create-case\n📄 src/pages/CreateCase.tsx' },
    position: { x: 600, y: 500 },
    style: { background: '#fce4ec', border: '2px solid #c2185b', color: '#880e4f' }
  },
  {
    id: '11',
    data: { label: 'Validate Environment\nVariables\n📄 api/create-case/index.js' },
    position: { x: 600, y: 600 },
    style: { background: '#fff3e0', border: '2px solid #f57c00', color: '#e65100' }
  },
  {
    id: '12a',
    data: { label: 'Return 500 Error\n📄 api/create-case/index.js' },
    position: { x: 400, y: 700 },
    style: { background: '#ffebee', border: '2px solid #f44336', color: '#b71c1c' }
  },
  {
    id: '12b',
    data: { label: 'Format Payload\nfor easitGO\n📄 api/create-case/index.js' },
    position: { x: 800, y: 700 },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', color: '#1b5e20' }
  },
  {
    id: '13',
    data: { label: 'Create Basic Auth\nHeader\n📄 api/create-case/index.js' },
    position: { x: 800, y: 800 },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2', color: '#4a148c' }
  },
  {
    id: '14',
    data: { label: 'POST to Service\nDesk API\n📄 api/create-case/index.js' },
    position: { x: 800, y: 900 },
    style: { background: '#fce4ec', border: '2px solid #c2185b', color: '#880e4f' }
  },
  {
    id: '15a',
    data: { label: 'Log Error &\nReturn 500\n📄 api/create-case/index.js' },
    position: { x: 600, y: 1000 },
    style: { background: '#ffebee', border: '2px solid #f44336', color: '#b71c1c' }
  },
  {
    id: '15b',
    data: { label: 'Return Success\nwith Case ID\n📄 api/create-case/index.js' },
    position: { x: 1000, y: 1000 },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', color: '#1b5e20' }
  },
  {
    id: '16',
    data: { label: 'Show Success Message\n📄 src/pages/CreateCase.tsx' },
    position: { x: 1000, y: 1100 },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2', color: '#4a148c' }
  },
  {
    id: '17',
    type: 'output',
    data: { label: 'Display Link to\nCreated Case\n📄 src/pages/CreateCase.tsx' },
    position: { x: 1000, y: 1200 },
    style: { background: '#e1f5fe', border: '2px solid #0277bd', color: '#01579b' }
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: '#0277bd', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', style: { stroke: '#388e3c', strokeWidth: 2 } },
  { id: 'e3-4a', source: '3', target: '4a', type: 'smoothstep', label: 'Commands', style: { stroke: '#f57c00', strokeWidth: 2 } },
  { id: 'e3-4b', source: '3', target: '4b', type: 'smoothstep', label: 'Other', style: { stroke: '#f57c00', strokeWidth: 2 } },
  { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', style: { stroke: '#0277bd', strokeWidth: 2 } },
  { id: 'e6-7', source: '6', target: '7', type: 'smoothstep', style: { stroke: '#388e3c', strokeWidth: 2 } },
  { id: 'e7-8', source: '7', target: '8', type: 'smoothstep', style: { stroke: '#f57c00', strokeWidth: 2 } },
  { id: 'e8-9', source: '8', target: '9', type: 'smoothstep', style: { stroke: '#7b1fa2', strokeWidth: 2 } },
  { id: 'e9-10', source: '9', target: '10', type: 'smoothstep', style: { stroke: '#0277bd', strokeWidth: 2 } },
  { id: 'e10-11', source: '10', target: '11', type: 'smoothstep', style: { stroke: '#c2185b', strokeWidth: 2 } },
  { id: 'e11-12a', source: '11', target: '12a', type: 'smoothstep', label: 'Missing', style: { stroke: '#f44336', strokeWidth: 2 } },
  { id: 'e11-12b', source: '11', target: '12b', type: 'smoothstep', label: 'Valid', style: { stroke: '#388e3c', strokeWidth: 2 } },
  { id: 'e12b-13', source: '12b', target: '13', type: 'smoothstep', style: { stroke: '#388e3c', strokeWidth: 2 } },
  { id: 'e13-14', source: '13', target: '14', type: 'smoothstep', style: { stroke: '#7b1fa2', strokeWidth: 2 } },
  { id: 'e14-15a', source: '14', target: '15a', type: 'smoothstep', label: 'Error', style: { stroke: '#f44336', strokeWidth: 2 } },
  { id: 'e14-15b', source: '14', target: '15b', type: 'smoothstep', label: 'Success', style: { stroke: '#388e3c', strokeWidth: 2 } },
  { id: 'e15b-16', source: '15b', target: '16', type: 'smoothstep', style: { stroke: '#388e3c', strokeWidth: 2 } },
  { id: 'e16-17', source: '16', target: '17', type: 'smoothstep', style: { stroke: '#7b1fa2', strokeWidth: 2 } }
];

export default function FlowChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const navigate = useNavigate();

  const downloadImage = useCallback(() => {
    const reactFlowNode = document.querySelector('.react-flow') as HTMLElement;
    if (!reactFlowNode) return;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = 1400;
    canvas.height = 1400;

    // Fill white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Convert HTML to canvas using html2canvas
    import('html2canvas').then((html2canvas) => {
      html2canvas.default(reactFlowNode, {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        width: 1400,
        height: 1400
      }).then((canvas) => {
        // Create download link
        const link = document.createElement('a');
        link.download = 'teams-bot-flow-chart.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  }, []);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        style={{ backgroundColor: "#F7F9FB" }}
      >
        <Panel position="top-left" className="flex gap-2">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button onClick={downloadImage} variant="default" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Chart
          </Button>
        </Panel>
        <MiniMap zoomable pannable />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}