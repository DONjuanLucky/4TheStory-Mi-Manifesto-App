import { useState } from 'react';
import Layout from './components/Layout';
import VoiceAgent from './components/VoiceAgent';
import BookEditor from './components/BookEditor';
import ResourceLibrary from './components/ResourceLibrary';

function App() {
  const [activeTab, setActiveTab] = useState('write');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'write' && <BookEditor />}
      {activeTab === 'resources' && <ResourceLibrary />}
      {activeTab === 'settings' && (
        <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
          <p>Settings coming soon...</p>
        </div>
      )}
      <VoiceAgent />
    </Layout>
  );
}

export default App;
