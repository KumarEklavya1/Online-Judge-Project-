import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-52px)] px-4 py-10 bg-judge-bg text-judge-text">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mb-16">
        <div className="font-mono text-[14px] text-judge-green mb-4 flex items-center justify-center gap-2">
          <span className="animate-pulse">_</span> system online
        </div>
        <h1 className="text-5xl font-bold text-judge-bright mb-6 tracking-tight">
          Master Algorithms.<br />
          <span className="text-judge-violet">Beat the Machine.</span>
        </h1>
        <p className="text-lg text-judge-dim mb-10 leading-relaxed max-w-2xl mx-auto">
          A high-performance algorithmic judging engine. Featuring sub-millisecond execution, isolated Docker sandboxing, and AI-powered code reviews to instantly level up your engineering skills.
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate('/problems')}
            className="btn-judge btn-judge-primary text-base py-3 px-8"
          >
            start coding ⏎
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="btn-judge text-base py-3 px-8 border-judge-dim text-judge-bright hover:border-judge-bright"
          >
            create account
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <FeatureCard 
          icon="⚡" 
          title="Isolated Execution" 
          desc="Code runs in secure Docker containers ensuring fair, consistent, and safe environment testing with strict time limits."
        />
        <FeatureCard 
          icon="✨" 
          title="AI Code Review" 
          desc="Don't just pass the test cases. Get instant AI feedback on time complexity, space complexity, and code cleanliness."
        />
        <FeatureCard 
          icon="📊" 
          title="Global Leaderboards" 
          desc="Track your progress, view submission history, and watch your developer ELO rise as you conquer harder problems."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card-judge p-6 hover:border-judge-green/50 transition-colors">
      <div className="text-2xl mb-4">{icon}</div>
      <h3 className="font-mono text-sm text-judge-bright mb-2">{title}</h3>
      <p className="text-sm text-judge-dim leading-relaxed">{desc}</p>
    </div>
  );
}