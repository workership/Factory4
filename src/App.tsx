/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardView } from './components/views/DashboardView';
import { SimulationView } from './components/views/SimulationView';
import { MonitoringView } from './components/views/MonitoringView';
import { SeedlingSystemView } from './components/views/SeedlingSystemView';
import { SchedulingView } from './components/views/SchedulingView';
import { FeedbackView } from './components/views/FeedbackView';
import { Task } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleAddTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  // Fetch tasks when switching to scheduling tab
  useEffect(() => {
    if (activeTab === 'scheduling') {
      fetchTasks();
    }
  }, [activeTab]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onAddTask={handleAddTask} />;
      case '3d-view':
        return <SimulationView />;
      case 'monitoring':
        return <MonitoringView />;
      case 'seedling-system':
        return <SeedlingSystemView />;
      case 'scheduling':
        return <SchedulingView tasks={tasks} />;
      case 'feedback':
        return <FeedbackView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0C10] text-gray-100 font-sans selection:bg-blue-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
