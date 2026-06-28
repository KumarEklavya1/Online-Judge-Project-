import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import EditorModule from "react-simple-code-editor";
import ReactMarkdown from "react-markdown";
import Prism from "prismjs";
import axios from "axios";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/themes/prism-tomorrow.css";

const Editor = EditorModule.default || EditorModule;
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


function difficultyClass(difficulty) {
  if (difficulty === "Easy") return "text-judge-green";
  if (difficulty === "Medium") return "text-judge-amber";
  return "text-judge-red";
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 font-mono text-xs border-b-2 transition-colors cursor-pointer ${
        active ? "text-judge-green border-judge-green" : "text-judge-dim border-transparent hover:text-judge-text"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProblemSolve() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(`#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`);

  const [activeTab, setActiveTab] = useState("input");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReview, setAiReview] = useState("");
  const [isAiReviewLoading, setIsAiReviewLoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/problems/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProblem(response.data);
        if (response.data.testCases && response.data.testCases.length > 0) {
          setInput(response.data.testCases[0].input);
        }
      } catch (err) {
        alert("Failed to load problem");
        navigate("/problems");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblem();
  }, [id, token, navigate]);

  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab("output");
    setOutput("running...");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/submissions/run`,
        { language, code, input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOutput(response.data.output);
    } catch (error) {
      setOutput(error?.response?.data?.error || "execution error");
    } finally {
      setIsRunning(false);
    }
  };

const handleSubmit = async () => {
    // 1. Check for token BEFORE sending the request
    if (!token) {
      alert("Session expired. Please log in.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setActiveTab("verdict");
    setVerdict({ status: "Judging..." });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/submissions/submit/${id}`,
        { language, code },
        { 
            headers: { Authorization: `Bearer ${token}` } 
        }
      );

      setVerdict({
        status: response.data.verdict,
        passed: response.data.passed,
        total: response.data.total,
        details: response.data.errorDetails || (response.data.expected ? `Expected: ${response.data.expected}\nReceived: ${response.data.received}` : "")
      });
    } catch (error) {
      // 2. Clear token if it's explicitly unauthorized
      if (error.response?.status === 401 || error.response?.status === 403) {
          alert("Unauthorized: Please log in again.");
          localStorage.removeItem("token"); // Clear bad token
          navigate("/login");
      } else {
          setVerdict({ status: "Error", details: "Failed to connect to judging server." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiReview = async () => {
    setIsAiReviewLoading(true);
    try {
      const response = await axios.post( `${API_BASE_URL}/api/submissions/ai-review`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiReview(response.data.review);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    } catch (error) {
      setAiReview("Failed to generate AI review.");
    } finally {
      setIsAiReviewLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-52px)] flex items-center justify-center">
        <p className="font-mono text-sm text-judge-dim">loading workspace...</p>
      </div>
    );
  }

  const verdictColor = verdict?.status === "Accepted" ? "text-judge-green" : verdict?.status === "Judging..." ? "text-judge-amber" : "text-judge-red";
  const verdictBg = verdict?.status === "Accepted" ? "bg-judge-green-bg" : verdict?.status === "Judging..." ? "bg-judge-amber-bg" : "bg-judge-red-bg";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-judge-border h-[calc(100vh-52px)] text-left">
      {/* LEFT PANE: PROBLEM STATEMENT */}
      <div className="bg-judge-bg overflow-y-auto px-8 py-7">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-mono text-xs text-judge-dim mb-1.5">PROB-{id?.slice(-4) || '0000'}</div>
            <h1 className="text-xl font-bold text-judge-bright m-0">{problem?.title}</h1>
          </div>
          <button onClick={() => navigate(`/submissions/${id}`)} className="btn-judge text-[11px] py-1.5 px-3 shrink-0">
            my submissions
          </button>
        </div>

        <div className="flex gap-4 mb-6 font-mono text-xs">
          <span className={`font-bold ${difficultyClass(problem?.difficulty)}`}>{problem?.difficulty?.toLowerCase()}</span>
          <span className="text-judge-dim">time {problem?.timeLimit}ms</span>
          <span className="text-judge-dim">mem {problem?.memoryLimit}mb</span>
        </div>

        <div className="text-sm leading-7 text-judge-text mb-7 whitespace-pre-wrap">{problem?.description}</div>

        <div className="font-mono text-xs uppercase tracking-wide text-judge-dim mb-2 flex items-center gap-2">
          <span className="text-judge-green">#</span> sample tests
        </div>

        {problem?.testCases?.filter(tc => !tc.isHidden).map((tc, idx) => (
          <div key={idx} className="mb-4">
            <div className="card-judge bg-judge-input mb-1.5 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-judge-border font-mono text-[11px] text-judge-dim">input</div>
              <pre className="m-0 p-3 font-mono text-[13px] text-judge-bright whitespace-pre-wrap">{tc.input}</pre>
            </div>
            <div className="card-judge bg-judge-input overflow-hidden">
              <div className="px-3 py-1.5 border-b border-judge-border font-mono text-[11px] text-judge-dim">output</div>
              <pre className="m-0 p-3 font-mono text-[13px] text-judge-bright whitespace-pre-wrap">{tc.output}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT PANE: EDITOR & TABS */}
      <div className="bg-judge-bg flex flex-col overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-judge-raised border-b border-judge-border">
            <span className="font-mono text-xs text-judge-dim">~/solution.{language === 'cpp' ? 'cpp' : 'js'}</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-judge-input text-judge-bright border border-judge-border-bright font-mono text-xs px-2.5 py-1.5 rounded-sm outline-none cursor-pointer">
              <option value="cpp">c++17</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto bg-judge-input">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={(code) => Prism.highlight(code, Prism.languages.cpp, "cpp")}
              padding={16}
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: "#c9d1c0", minHeight: "100%" }}
              className="focus:outline-none"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 px-4 py-3 bg-judge-raised border-t border-b border-judge-border">
          <button onClick={handleRun} disabled={isRunning || isSubmitting} className="btn-judge flex-1">
            {isRunning ? "running..." : "run ▷ custom input"}
          </button>
          <button onClick={handleSubmit} disabled={isRunning || isSubmitting} className="btn-judge btn-judge-primary flex-1">
            {isSubmitting ? "judging..." : "submit ⏎"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-judge-border bg-judge-raised">
          <TabButton active={activeTab === "input"} onClick={() => setActiveTab("input")}>custom input</TabButton>
          <TabButton active={activeTab === "output"} onClick={() => setActiveTab("output")}>output</TabButton>
          <TabButton active={activeTab === "verdict"} onClick={() => setActiveTab("verdict")}>verdict</TabButton>
        </div>

        <div className="h-[230px] overflow-y-auto px-4 py-3.5 font-mono text-xs">
          {activeTab === "input" && (
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input-judge h-full resize-none" placeholder="type custom input here..." />
          )}

          {activeTab === "output" && (
            <pre className={`m-0 whitespace-pre-wrap ${output.includes("error") || output.includes("Error") ? "text-judge-red" : "text-judge-text"}`}>
              {output || "run code to see output."}
            </pre>
          )}

          {activeTab === "verdict" && (
            <div>
              {!verdict ? (
                <p className="text-judge-dim">submit code to see verdict.</p>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className={`font-bold text-sm px-2.5 py-1 rounded-sm ${verdictColor} ${verdictBg}`}>
                      {verdict.status?.toUpperCase()}
                    </span>
                  </div>
                  {verdict.total && (
                    <p className="text-judge-dim mb-2">{verdict.passed} / {verdict.total} testcases passed</p>
                  )}
                  {verdict.details && (
                    <pre className="text-judge-red bg-judge-red-bg p-3 rounded-sm whitespace-pre-wrap">{verdict.details}</pre>
                  )}

                  {verdict.status === "Accepted" && (
                    <button onClick={handleAiReview} disabled={isAiReviewLoading} className="btn-judge mt-3 border-judge-violet text-judge-violet hover:bg-judge-violet/10">
                      {isAiReviewLoading ? "analyzing..." : "generate ai code review"}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI REVIEW OVERLAY */}
      {aiReview && (
        <div className="fixed bottom-5 right-5 w-[400px] max-h-[400px] card-judge !border-l-2 !border-l-judge-violet bg-judge-raised p-5 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-sm text-judge-violet m-0">ai review</h3>
            <button onClick={() => setAiReview("")} className="text-judge-dim hover:text-judge-bright text-sm bg-transparent border-none cursor-pointer">✕</button>
          </div>
          <div className="text-sm leading-relaxed text-judge-text whitespace-pre-wrap">
            <ReactMarkdown>{aiReview}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}